import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CampaignDataEntity } from '../campaign-data/entities/campaign-datum.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from '../s3/s3.service';
import { CampaignTypesService } from '../campaign-types/campaign-types.service';
import { CampaignDataEnum } from '../common/enums/campaign-dataum.enum';
import { OriginalCampaignData } from '../orignal-campaign-data/entities/orignal-campaign-datum.entity';
import { stringify } from 'csv-stringify/sync';
import { FilteringModeEnum } from '../common/enums/filtering-mode.enum';




@Injectable()
@Processor('default')
export class OriginalCampaignDataProcessor {
    private readonly logger = new Logger(OriginalCampaignDataProcessor.name);

    constructor(
        @InjectRepository(CampaignDataEntity)
        private readonly campaignDataRepository: Repository<CampaignDataEntity>,
        @InjectRepository(OriginalCampaignData)
        private readonly originalDataRepository: Repository<OriginalCampaignData>,
        private readonly s3Service: S3Service,
        private readonly campaignTypeService: CampaignTypesService,
    ) { }


    @Process('processOriginalData')
    async handleProcessOriginalData(job: Job): Promise<void> {
        const { originalDataId, campaignTypeId, duplicateFieldCheck, campaignDataId, baseName, ext, filteringIncludeOrExclude } = job.data;

        try {
            this.logger.log(`Processing job with ID ${job.id} and originalDataId: ${originalDataId}`);

            const originalData = await this.originalDataRepository.findOne({ where: { id: originalDataId } });
            if (!originalData) throw new HttpException('OriginalCampaignData not found', HttpStatus.NOT_FOUND);

            const campaignData = await this.campaignDataRepository.findOne({ where: { id: campaignDataId } });
            if (!campaignData) throw new HttpException('CampaignData not found', HttpStatus.NOT_FOUND);

            // Download and parse the file from S3
            const data = await this.s3Service.downloadAndParseFile(originalData.s3Url);

            const filteredData =  originalData.filterCriteria ? this.applyFilterCriteria(data, originalData.filterCriteria, filteringIncludeOrExclude):data 

            const phoneNumberFormatedData = filteredData.filter(record => {
                const formattedRecord = { ...record };
                
                // Validate and format phone number
                if (formattedRecord['phoneNumber']) {
                    const isValidUSNumber = this.isValidUSPhoneNumber(formattedRecord['phoneNumber']);
                    if (isValidUSNumber) {
                        formattedRecord['phoneNumber'] = this.formatPhoneNumber(formattedRecord['phoneNumber']);
                    } else {
                        return false; // Exclude this record if phone number is invalid
                    }
                }
            
                // Trim empty values
                return this.trimEmptyValues(formattedRecord);
            });
            // Deduplicate within the file using the provided fields
            const { uniqueData, duplicateData } = this.removeDuplicatesAndTrack(phoneNumberFormatedData, duplicateFieldCheck);

            // Verify duplicates across other campaigns using duplicateFieldCheck
            const { verifiedData, repeatedData } = await this.verifyDuplicatesAcrossCampaigns(uniqueData, campaignTypeId, duplicateFieldCheck, originalData.s3Url);

            const cleanedData = this.removeEmptyColumns(verifiedData);

            // Convert the verified data back to CSV (or the required format) and upload to S3
            const newS3Url = await this.s3Service.uploadProcessedData(process.env.PROCESSED_DATA_DIR, baseName, cleanedData);


            const { duplicateCsv, repeatedCsv } = await this.createDuplicateAndRepeatedCsvs(duplicateData, repeatedData, originalData.s3Url, duplicateFieldCheck);

            const duplicateCsvUrl = await this.s3Service.uploadStatsData(process.env.STATS_DIR, `${baseName}_duplicates.csv`, duplicateCsv);
            const repeatedCsvUrl = await this.s3Service.uploadStatsData(process.env.STATS_DIR, `${baseName}_repeated.csv`, repeatedCsv);



            // Update the existing CampaignData record
            campaignData.data = cleanedData;
            campaignData.status = CampaignDataEnum.SUCCESS;
            campaignData.s3Url = newS3Url;
            campaignData.duplicateStatsS3Url = duplicateCsvUrl
            campaignData.replicatedStatsS3Url = repeatedCsvUrl
            campaignData.campaign = null;

            // Save the updated CampaignData
            await this.campaignDataRepository.save(campaignData);

            this.logger.log(`Job with ID ${job.id} completed successfully. Stats URL: ${duplicateCsvUrl} ${repeatedCsvUrl}`);
        } catch (error) {
            // If there's an error, update the status to FAILURE and save it
            const campaignData = await this.campaignDataRepository.findOne({ where: { id: campaignDataId } });
            if (campaignData) {
                campaignData.status = CampaignDataEnum.FAILURE;
                await this.campaignDataRepository.save(campaignData);
            }
            this.logger.error(`Job with ID ${job.id} failed with error: ${error.message}`, error.stack);
        }
    }


    private formatPhoneNumber(phoneNumber: string): string {
        const cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove non-numeric characters
        if (cleanNumber.length === 11 && cleanNumber.startsWith('1')) {
            // Remove leading "1" if it's a US international number
            return `(${cleanNumber.slice(1, 4)}) ${cleanNumber.slice(4, 7)}-${cleanNumber.slice(7)}`;
        } else if (cleanNumber.length === 10) {
            return `(${cleanNumber.slice(0, 3)}) ${cleanNumber.slice(3, 6)}-${cleanNumber.slice(6)}`;
        }
        return phoneNumber; // Return the original number if it's invalid
    }

    private isValidUSPhoneNumber(phoneNumber: string): boolean {
        const usPhoneNumberRegex = /^(\+1\s?)?(\(\d{3}\)|\d{3})[\s.-]?\d{3}[\s.-]?\d{4}$/;
        return usPhoneNumberRegex.test(phoneNumber);
    }

    private trimEmptyValues(record: Record<string, any>): Record<string, any> {
        const cleanedRecord = {};
        Object.keys(record).forEach(key => {
            if (typeof record[key] === 'string') {
                cleanedRecord[key] = record[key].trim() || ''; // Trim the value, if empty assign empty string
            } else {
                cleanedRecord[key] = record[key];
            }
        });
        return cleanedRecord;
    }


    private removeEmptyColumns(data: any[]): any[] {
        if (data.length === 0) return data;
    
        // First, filter out any empty key columns and get non-empty columns
        const nonEmptyColumns = Object.keys(data[0]).filter(column => {
            return column.trim() !== '' && data.some(record => record[column] && record[column].trim() !== '');  // Keep columns with non-empty keys and values
        });
    
        // Clean the records by including only non-empty keys and columns with non-empty values
        return data.map(record => {
            const cleanedRecord = {};
            nonEmptyColumns.forEach(column => {
                if (column.trim() !== '') { // Ensure we do not include empty string keys
                    cleanedRecord[column.trim()] = record[column] ? record[column].trim() : ''; // Trim values and remove empty ones
                }
            });
            return cleanedRecord;
        });
    }


    private applyFilterCriteria(data: any[], filterCriteria: Record<string, string[]>, filteringIncludeOrExclude: FilteringModeEnum): any[] {
        if (!filterCriteria || Object.keys(filterCriteria).length === 0) {
            return data; // If no filter criteria, return the data as is
        }

        return data.filter(record => {
            const match = Object.keys(filterCriteria).every(field => {
                if (!record[field]) return false; // Field is missing in the record
                return filterCriteria[field].includes(record[field]); // Check if the record value matches the criteria
            });

            // Apply 'include' or 'exclude' logic
            return filteringIncludeOrExclude === 'include' ? match : !match;
        });
    }

    private removeDuplicatesAndTrack(data: any[], duplicateFieldCheck: string[]) {
        const uniqueData = [];
        const duplicateData = new Map<string, any>(); // Use a Map to ensure uniqueness by key
        const seenKeys = new Set<string>();

        data.forEach(record => {
            const key = duplicateFieldCheck
            .map(field => (record[field] && typeof record[field] === 'string') ? record[field].trim() : '') // Handle undefined, null, or non-string fields
            .filter(value => value !== '') 
            .join('|');
            if (key === '') return;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueData.push(record);
            } else {
                duplicateData.set(key, record);
            }
        });

        

        return { uniqueData, duplicateData: Array.from(duplicateData.values()) }; // Convert Map to Array
    }

    private async verifyDuplicatesAcrossCampaigns(
        data: any[],
        campaignTypeId: string,
        duplicateFieldCheck: string[],
        originalDataS3Url: string
    ): Promise<{ verifiedData: any[], repeatedData: any[] }> {
        try {
            const campaignType = await this.campaignTypeService.findOne({ id: campaignTypeId });
            if (!campaignType) {
                throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
            }

            const allCampaignData = await this.campaignDataRepository.find({
                where: { campaignType: { id: campaignTypeId } },
                relations: ['originalData'],
            });




            // Build a map where the key is the concatenated duplicate fields and the value is a set of S3 URLs
            const duplicatesMap = new Map<string, { record: any, urls: Set<string> }>();

            allCampaignData.forEach(campaignData => {
                if (campaignData.data && Array.isArray(campaignData.data)) {
                    campaignData.data.forEach(record => {

                        const key = record[duplicateFieldCheck[0]]

                        const shouldSkip = duplicateFieldCheck.some(field => !record[field]);

                        if (shouldSkip) {
                            console.warn("Skipping record due to empty or undefined duplicate fields:", record);
                            return; // Skip to the next record
                        }

                        if (!duplicatesMap.has(key)) {
                            duplicatesMap.set(key, { record, urls: new Set<string>() });
                            //console.log(key)
                        }

                        // Append the URL to the existing Set for this key
                        if (campaignData.originalData?.s3Url) {
                            const existingEntry = duplicatesMap.get(key);
                            existingEntry.urls.add(campaignData.originalData.s3Url);
                            console.log("Current URLs for key:", key, Array.from(existingEntry.urls)); // Debugging: Print the URLs for this key
                        }
                    });
                }
            });


            const verifiedData = [];
            const repeatedData = new Map<string, any>(); // Use a Map to ensure uniqueness by duplicate fields key

            data.forEach(record => {
                const key = record[duplicateFieldCheck[0]]

                if (duplicatesMap.has(key)) {
                    const existing = duplicatesMap.get(key)!;
                    const urls = Array.from(existing.urls);

                    if (repeatedData.has(key)) {
                        const existingRecord = repeatedData.get(key);
                        console.log(existingRecord.RepeatedDataURLs)
                        // existingRecord.RepeatedDataURLs = Array.from(new Set(existingRecord.RepeatedDataURLs.concat(urls))).join('\n\n');

                        existingRecord.RepeatedDataURLs = Array.from(
                            new Set(existingRecord.RepeatedDataURLs.split('\n\n').concat(urls))
                        ).join('\n\n');
                    } else {
                        repeatedData.set(key, {
                            ...record,
                            RepeatedDataURLs: urls.join('\n\n'),
                        });
                    }
                } else {
                    verifiedData.push(record);
                }
            });

            // Ensure verifiedData is not empty
            if (verifiedData.length === 0 && data.length > 0) {
                const emptyObject = Object.keys(data[0]).reduce((acc, key) => {
                    acc[key] = '';
                    return acc;
                }, {});
                verifiedData.push(emptyObject);
            }

            return { verifiedData, repeatedData: Array.from(repeatedData.values()) };
        } catch (error) {
            this.logger.error('Error verifying duplicates across campaigns', error.stack);
            throw new HttpException('Error verifying duplicates across campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private async createDuplicateAndRepeatedCsvs(
        duplicateData: any[],
        repeatedData: any[],
        originalDataS3Url: string,
        duplicateFieldCheck: string[]
    ): Promise<{ duplicateCsv: string, repeatedCsv: string }> {

        const signedOriginalDataUrl = await this.s3Service.generateSignedUrlWithTime(originalDataS3Url, 345600);





        const duplicateStats = duplicateData.map(record => {
            const duplicateFields = {};
            duplicateFieldCheck.forEach(field => {
                duplicateFields[field] = record[field];
            });

            return {
                ...duplicateFields,
                OriginalDataURL: signedOriginalDataUrl
            };
        });



        // Process repeated records across campaigns
        const repeatedStats = await Promise.all(repeatedData.map(async (record) => {
            const repeatedFields = {};
            duplicateFieldCheck.forEach(field => {
                repeatedFields[field] = record[field];
            });

            const signedUrls = await Promise.all(
                record.RepeatedDataURLs.split('\n\n').map(url => this.s3Service.generateSignedUrlWithTime(url, 345600))
            );

            return {
                ...repeatedFields,
                RepeatedDataURLs: signedUrls.join('\n\n')
            };
        }));

        // Define CSV headers for duplicate and repeated files
        const duplicateHeaders = [
            ...duplicateFieldCheck,
            'OriginalDataURL'
        ];

        const repeatedHeaders = [
            ...duplicateFieldCheck,
            'RepeatedDataURLs'
        ];

        // Convert the data to CSV format
        const duplicateCsv = stringify(duplicateStats, { header: true, columns: duplicateHeaders });
        const repeatedCsv = stringify(repeatedStats, { header: true, columns: repeatedHeaders });

        return { duplicateCsv, repeatedCsv };
    }
}












