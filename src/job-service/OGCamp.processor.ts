import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CampaignData } from '../campaign-data/entities/campaign-datum.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { S3Service } from '../s3/s3.service';
import { CampaignTypesService } from '../campaign-types/campaign-types.service';
import { CampaignDataEnum } from '../common/enums/campaign-dataum.enum';
import { OriginalCampaignData } from '../orignal-campaign-data/entities/orignal-campaign-datum.entity';
import { stringify } from 'csv-stringify/sync';



@Injectable()
@Processor('default')
export class OriginalCampaignDataProcessor {
  private readonly logger = new Logger(OriginalCampaignDataProcessor.name);

  constructor(
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    @InjectRepository(OriginalCampaignData)
    private readonly originalDataRepository: Repository<OriginalCampaignData>,
    private readonly s3Service: S3Service,
    private readonly campaignTypeService: CampaignTypesService,
  ) {}

  // @Process('processOriginalData')
  // async handleProcessOriginalData(job: Job): Promise<void> {
  //   const { originalDataId, campaignTypeId, duplicateFieldCheck, campaignDataId,baseName,ext } = job.data;
  
  //   try {
  //     this.logger.log(`Processing job with ID ${job.id} and originalDataId: ${originalDataId}`);
  
  //     const originalData = await this.originalDataRepository.findOne({ where: { id: originalDataId } });
  //     if (!originalData) throw new HttpException('OriginalCampaignData not found', HttpStatus.NOT_FOUND);
  
  //     const campaignData = await this.campaignDataRepository.findOne({ where: { id: campaignDataId } });
  //     if (!campaignData) throw new HttpException('CampaignData not found', HttpStatus.NOT_FOUND);
  
  //     // Download and parse the file from S3
  //     const data = await this.s3Service.downloadAndParseFile(originalData.s3Url);

  
  //     // Deduplicate within the file using the provided fields
  //     const uniqueData = this.removeDuplicatesWithinFile(data, duplicateFieldCheck);
  
  //     // Verify phone numbers do not exist in other campaign data with the same campaign type
  //     const verifiedData = await this.verifyPhoneNumbersAcrossCampaigns(uniqueData, campaignTypeId);

      
  //     // Convert the verified data back to CSV (or the required format) and upload to S3
  //     const newS3Url = await this.s3Service.uploadProcessedData(process.env.PROCESSED_DATA_DIR,baseName, verifiedData);

  //     verifiedData.forEach((record, index) => {
  //       record.id = `rec_${index}_${Date.now()}`;
  //       record.agent = null; // Initially set to null, will be updated later
  //       record.call_result = null; // Initially set to null, will be updated later
  //       record.updated_at = null; // Initially set to null, will be updated later
  //     });
  
  //     // Update the existing CampaignData record
  //     campaignData.data = verifiedData;  // Optionally store the data as JSON in DB
  //     campaignData.status = CampaignDataEnum.SUCCESS;
  //     campaignData.s3Url = newS3Url; // Set the new S3 URL
  
  //     // Save the updated CampaignData
  //     await this.campaignDataRepository.save(campaignData);
  
  //     this.logger.log(`Job with ID ${job.id} completed successfully.`);
  //   } catch (error) {
  //     // If there's an error, update the status to FAILURE and save it
  //     const campaignData = await this.campaignDataRepository.findOne({ where: { id: campaignDataId } });
  //     if (campaignData) {
  //       campaignData.status = CampaignDataEnum.FAILURE;
  //       await this.campaignDataRepository.save(campaignData);
  //     }
  //     this.logger.error(`Job with ID ${job.id} failed with error: ${error.message}`, error.stack);
  //   }
  // }
  // private removeDuplicatesWithinFile(data: any[], duplicateFieldCheck: string[]): any[] {
  //   const uniqueData = [];
  //   const seenKeys = new Set();

  //   data.forEach(record => {
  //     const key = duplicateFieldCheck.map(field => record[field]).join('|');
  //     if (!seenKeys.has(key)) {
  //       seenKeys.add(key);
  //       uniqueData.push(record);
  //     }
  //   });

  //   return uniqueData;
  // }

  // private async verifyPhoneNumbersAcrossCampaigns(data: any[], campaignTypeId: string): Promise<any[]> {
  //   try {
  //     const campaignType = await this.campaignTypeService.findOne({ id: campaignTypeId });
  //     if (!campaignType) {
  //       throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     const allCampaignData = await this.campaignDataRepository.find({ 
  //       where: { 
  //           campaignType: {
  //               id: campaignTypeId // Using the campaignTypeId directly here
  //           } 
  //       } 
  //   });
  
  //     // Logging the retrieved campaign data for debugging
  //     this.logger.log(`Retrieved campaign data: ${JSON.stringify(allCampaignData)}`);
  
  //     const phoneNumbersInOtherCampaigns = new Set(
  //       allCampaignData.flatMap(campaignData => {
  //         // Check if the data structure is correct and has phoneNumber fields
  //         if (campaignData.data && Array.isArray(campaignData.data)) {
  //           return campaignData.data.map(record => {
  //             // Logging each record for debugging
  //             this.logger.log(`Processing record: ${JSON.stringify(record)}`);
  //             return record.phoneNumber;
  //           });
  //         } else {
  //           return [];
  //         }
  //       })
  //     );
  
  //     // Logging the set of phone numbers found in other campaigns
  //     this.logger.log(`Phone numbers in other campaigns: ${Array.from(phoneNumbersInOtherCampaigns).join(', ')}`);
  
  //     const filteredData = data.filter(record => {
  //       // Log each comparison
  //       //this.logger.log(`Checking phone number: ${record.phoneNumber}`);
  //       return !phoneNumbersInOtherCampaigns.has(record.phoneNumber);
  //     });

  //     // If filteredData is empty, initialize it with one empty object
  //     if (filteredData.length === 0 && data.length > 0) {
  //       const emptyObject = Object.keys(data[0]).reduce((acc, key) => {
  //         acc[key] = '';
  //         return acc;
  //       }, {});
        
  //       filteredData.push(emptyObject);
  //     }

  //     return filteredData;
  //   } catch (error) {
  //     this.logger.error('Error verifying phone numbers across campaigns', error.stack);
  //     throw new HttpException('Error verifying phone numbers across campaigns', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  @Process('processOriginalData')
  async handleProcessOriginalData(job: Job): Promise<void> {
      const { originalDataId, campaignTypeId, duplicateFieldCheck, campaignDataId, baseName, ext } = job.data;
  
      try {
          this.logger.log(`Processing job with ID ${job.id} and originalDataId: ${originalDataId}`);
  
          const originalData = await this.originalDataRepository.findOne({ where: { id: originalDataId } });
          if (!originalData) throw new HttpException('OriginalCampaignData not found', HttpStatus.NOT_FOUND);
  
          const campaignData = await this.campaignDataRepository.findOne({ where: { id: campaignDataId } });
          if (!campaignData) throw new HttpException('CampaignData not found', HttpStatus.NOT_FOUND);
  
          // Download and parse the file from S3
          const data = await this.s3Service.downloadAndParseFile(originalData.s3Url);
  
          // Deduplicate within the file using the provided fields
          const { uniqueData, duplicateData } = this.removeDuplicatesAndTrack(data, duplicateFieldCheck);
  
          // Verify duplicates across other campaigns using duplicateFieldCheck
          const { verifiedData, repeatedData } = await this.verifyDuplicatesAcrossCampaigns(uniqueData, campaignTypeId, duplicateFieldCheck, originalData.s3Url);
  
          // Add extra fields to verifiedData
          verifiedData.forEach((record, index) => {
              record.id = `rec_${index}_${Date.now()}`;
              record.agent = null;
              record.call_result = null;
              record.updated_at = null;
          });
  
          // Convert the verified data back to CSV (or the required format) and upload to S3
          const newS3Url = await this.s3Service.uploadProcessedData(process.env.PROCESSED_DATA_DIR, baseName, verifiedData);
  
          // Create CSV for stats (duplicate and repeated records)
        // Generate CSV files
        const { duplicateCsv, repeatedCsv } = await this.createDuplicateAndRepeatedCsvs(duplicateData, repeatedData, originalData.s3Url, duplicateFieldCheck);

        // Upload both CSVs
        const duplicateCsvUrl = await this.s3Service.uploadStatsData(process.env.STATS_DIR, `${baseName}_duplicates.csv`, duplicateCsv);
        const repeatedCsvUrl = await this.s3Service.uploadStatsData(process.env.STATS_DIR, `${baseName}_repeated.csv`, repeatedCsv);

        
  
          // Update the existing CampaignData record
          campaignData.data = verifiedData;
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
  
  private removeDuplicatesAndTrack(data: any[], duplicateFieldCheck: string[]) {
      const uniqueData = [];
      const duplicateData = new Map<string, any>(); // Use a Map to ensure uniqueness by key
      const seenKeys = new Set<string>();
  
      data.forEach(record => {
          const key = duplicateFieldCheck.map(field => record[field]).join('|');
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












