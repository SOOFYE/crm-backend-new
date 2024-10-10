import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';

import { PaginateCampaignDataDto } from './dto/PaginateCampaignData.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CampaignDataEntity } from './entities/campaign-datum.entity';
import { createObjectCsvStringifier } from 'csv-writer';
import { CallResultEnum } from '../common/enums/call-result.enum';
import { CampaignDataEnum } from '../common/enums/campaign-dataum.enum';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { CampaignStatusEnum } from '../common/enums/campaign-stats.enum';
import { match } from 'assert';

@Injectable()
export class CampaignDataService {
  constructor(
    @InjectRepository(CampaignDataEntity)
    private readonly campaignDataRepository: Repository<CampaignDataEntity>,
    @InjectRepository(CampaignEntity)
    private readonly campaignRepository: Repository<CampaignEntity>,
  ) {}




  async getAllForDropdown(campaignTypeId?: string): Promise<CampaignDataEntity[]> {
    try {
      const queryBuilder = this.campaignDataRepository.createQueryBuilder('campaignData')
        .where('campaignData.status = :status', { status: CampaignDataEnum.SUCCESS });
  
      // If a campaignTypeId is provided, add it to the query
      if (campaignTypeId) {
        queryBuilder.andWhere('campaignData.campaignTypeId = :campaignTypeId', { campaignTypeId });
      }
  
      const data = await queryBuilder.getMany();
  
      return data;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error; // re-throw the HttpException if it's already an instance
      }
      throw new HttpException(
        'Failed to fetch campaign data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(criteria: FindOptionsWhere<CampaignDataEntity>): Promise<CampaignDataEntity> {
    try {
      const campaignData = await this.campaignDataRepository.findOne({ where: criteria });
      return campaignData;
    } catch (error) {
      
      console.log(error)
      
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching campaign data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchProcessedDataByPhoneNumber(
    campaignId: string,
    phoneNumber: string
  ): Promise<{ id: string; matchedRecord: any, campaignName: string }> {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['processedData'],
    });
  
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
  
    // Search for the phone number in all linked processed data
    for (const data of campaign.processedData) {
      const matchingRecord = data.data.find((record) => record.phoneNumber === phoneNumber);
      console.log(matchingRecord,phoneNumber)
      if (matchingRecord) {
        return { id: data.id, matchedRecord: matchingRecord, campaignName: campaign.name  };
      }
    }
  
    throw new NotFoundException('Phone number not found');
  }

  async getAllCampaignDataIdsAndNames(): Promise<CampaignDataEntity[]> {
    try {
      const campaignData =  this.campaignDataRepository.find({
        select: ['id', 'name'],
      });
      return campaignData;
    } catch (error) {
      throw new Error(`Failed to get campaign data: ${error.message}`);
    }
  }




  // async linkCampaignData(campaignDataId: string, campaignId: string): Promise<boolean> {
  //   try {
  //     // Fetch the campaign data and ensure it includes the campaign relation
  //     const campaignData = await this.campaignDataRepository.findOne({
  //       where: { id: campaignDataId },
  //       relations: ['campaign', 'campaignType'],
  //     });
  
  //     if (!campaignData) {
  //       throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     if (campaignData.campaign !== null) {
  //       throw new HttpException('Campaign is already linked', HttpStatus.BAD_REQUEST);
  //     }
  
  //     if (campaignData.status !== CampaignDataEnum.SUCCESS) {
  //       throw new HttpException('Campaign data processing not completed', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // Fetch the campaign and ensure it includes the campaignType relation
  //     const campaign = await this.campaignRepository.findOne({
  //       where: { id: campaignId },
  //       relations: ['campaignType', 'processedData'],
  //     });
  
  //     if (!campaign) {
  //       throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     // Ensure the campaign type IDs match
  //     if (campaignData.campaignType.id !== campaign.campaignType.id) {
  //       throw new HttpException('Campaign type mismatch between campaign data and campaign', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // Check if campaign.filterField fields exist in the first object of campaignData.data
  //     const firstDataRecord = campaignData.data?.[0];
  //     if (!firstDataRecord) {
  //       throw new HttpException('No data available in campaign data', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // If filterField exists, validate the fields
  //     if (campaign.filterField?.length) {
  //       const missingFields = campaign.filterField.filter(field => !(field in firstDataRecord));
  //       if (missingFields.length > 0) {
  //         throw new HttpException(
  //           `The following fields are missing in the campaign data: ${missingFields.join(', ')}`,
  //           HttpStatus.BAD_REQUEST,
  //         );
  //       }
  //     }
  
  //     // If either filterField or filterCriteria exists, process the filter
  //     let filteredData;
  //     if (campaign.filterField?.length || Object.keys(campaign.filterCriteria || {}).length) {
  //       filteredData = this.processFilterCriteria(campaignData.data, campaign.filterField, campaign.filterCriteria);
  //     } else {
  //       // No filtering required, just assign the data as it is
  //       filteredData = campaignData.data;
  //     }
  
  //     // Assign the filtered/unfiltered data to the campaign
  //     campaign.filteredData = filteredData;
  //     campaign.processedData = campaignData;
  
  //     // Link the campaign to the campaign data
  //     campaignData.campaign = campaign;
  
  //     // Save both campaign and campaignData
  //     await this.campaignRepository.save(campaign);
  //     await this.campaignDataRepository.save(campaignData);
  
  //     return true;
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to link campaign data',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }


  //  processFilterCriteria(data: any[], filterFields: string[], filterCriteria: Record<string, string[]>): any[] {
  //   // Filter the data based on filterFields and filterCriteria
  //   return data.filter(record => {
  //     return filterFields.every(field => {
  //       const criteria = filterCriteria[field];
  //       // If no criteria for the field, include the record
  //       if (!criteria || criteria.length === 0) return true;
  //       // Check if the record field matches any of the criteria
  //       return criteria.includes(record[field]);
  //     });
  //   });
  // }


  // async unLinkCampaign(campaignDataId: string): Promise<Boolean> {
  //   try {
  //     // Fetch the campaign data including its relations
  //     const campaignData = await this.campaignDataRepository.findOne({
  //       where: { id: campaignDataId },
  //       relations: ['campaign'],
  //     });
  
  //     if (!campaignData) {
  //       throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     // Check if there is an associated campaign
  //     if (!campaignData.campaign) {
  //       throw new HttpException('No associated campaign to unlink', HttpStatus.BAD_REQUEST);
  //     }
  
  //     // Fetch the associated campaign entity
  //     const campaign = await this.campaignRepository.findOne({
  //       where: { id: campaignData.campaign.id },
  //       relations: ['processedData'], // Fetch the relation with the processed data
  //     });
  
  //     if (!campaign) {
  //       throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     // Unlink the campaign from campaignData
  //     campaignData.campaign = null;
  //     await this.campaignDataRepository.save(campaignData);
  
  //     // Unlink the processed data from campaign
  //     campaign.processedData = null;
  //     await this.campaignRepository.save(campaign);
  
  //     return true; 
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to unlink campaign data',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async paginateCampaignData(id: string, options: PaginateCampaignDataDto, goodZipCodes?: string[]) {
  //   try {
  //     const campaignData = await this.campaignDataRepository.findOne({
  //       where: { id },
  //     });
  
  //     if (!campaignData) {
  //       throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     let data = campaignData.data || [];
  
  //     // Filter based on goodZipCodes if provided
  //     if (goodZipCodes && goodZipCodes.length > 0) {
  //       data = data.filter(item => goodZipCodes.includes(item.zipcode));
  //     }
  
  //     // Filtering based on searchKey
  //     if (options.searchKey) {
  //       data = data.filter(item => {
  //         return (
  //           Object.values(item).some(value =>
  //             String(value).toLowerCase().includes(options.searchKey.toLowerCase())
  //           )
  //         );
  //       });
  //     }
  
  //     // Filtering based on agent, call_result, or updated_at if provided
  //     if (options.filters) {
  //       if (options.filters.agent) {
  //         data = data.filter(item => item.agent === options.filters.agent);
  //       }
  
  //       if (options.filters.call_result) {
  //         data = data.filter(item => item.call_result === options.filters.call_result);
  //       }
  
  //       if (options.filters.updated_at) {
  //         const filterDate = new Date(options.filters.updated_at);
  //         data = data.filter(item => {
  //           const itemDate = new Date(item.updated_at);
  //           return itemDate.getTime() === filterDate.getTime();
  //         });
  //       }
  //     }
  
  //     // Sorting
  //     if (options.orderBy) {
  //       data.sort((a, b) => {
  //         const order = options.orderDirection === 'DESC' ? -1 : 1;
  //         return a[options.orderBy] > b[options.orderBy] ? order : -order;
  //       });
  //     }
  
  //     // Pagination
  //     const total = data.length;
  //     const startIndex = (options.page - 1) * options.limit;
  //     const endIndex = startIndex + options.limit;
  //     const paginatedData = data.slice(startIndex, endIndex);
  
  //     return {
  //       data: paginatedData,
  //       total,
  //       page: options.page,
  //       limit: options.limit,
  //       hasNext: endIndex < total,
  //     };
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to paginate campaign data',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }


  // async updateCallResult(campaignDataId: string, recordId: string, agentId: string, callResult: CallResultEnum, rescheduledDate?: Date): Promise<void> {
  //   try {
      
  //     const campaignData = await this.campaignDataRepository.findOne({
  //       where: { id: campaignDataId },
  //       relations: ['campaign'], // Include the 'campaign' relation
  //     });
  
  //     if (!campaignData) {
  //       throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     const record = campaignData.data.find(item => item.id === recordId);
  
  //     if (!record) {
  //       throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
  //     }
  
  //     record.agent = agentId;
  //     record.call_result = callResult;
  //     record.updated_at = new Date();
  
  //     if (callResult === CallResultEnum.RE_SCHEDULE && rescheduledDate) {
  //       await this.rescheduledCallService.create({
  //         campaign: campaignData.campaign.id,
  //         preprocessedData: campaignDataId,
  //         recordId: recordId,
  //         scheduledDate: rescheduledDate,
  //       });
  //     }
  
  //     await this.campaignDataRepository.save(campaignData);
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to update call result',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // async downloadCampaignDataAsCsv(id: string): Promise<string> {
  //   try {
  //     const campaignData = await this.campaignDataRepository.findOne({
  //       where: { id },
  //     });

  //     if (!campaignData) {
  //       throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
  //     }

  //     const data = campaignData.data || [];

  //     // If data is empty
  //     if (data.length === 0) {
  //       throw new HttpException('No data available to download', HttpStatus.NO_CONTENT);
  //     }

  //     // Create CSV Stringifier
  //     const csvStringifier = createObjectCsvStringifier({
  //       header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
  //     });

  //     // Generate CSV content
  //     const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

  //     return csvContent;
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to download campaign data',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  
}

  
