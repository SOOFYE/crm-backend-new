import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { PaginateCampaignDataDto } from './dto/PaginateCampaignData.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CampaignData } from './entities/campaign-datum.entity';


import { createObjectCsvStringifier } from 'csv-writer';
import { CallResultEnum } from '../common/enums/call-result.enum';
import { RescheduledCallsService } from '../rescheduled-calls/rescheduled-calls.service';

@Injectable()
export class CampaignDataService {
  constructor(
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    private readonly rescheduledCallService: RescheduledCallsService
  ) {}
  async paginateCampaignData(id: string, options: PaginateCampaignDataDto, goodZipCodes?: string[]) {
    try {
      const campaignData = await this.campaignDataRepository.findOne({
        where: { id },
      });
  
      if (!campaignData) {
        throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
      }
  
      let data = campaignData.data || [];
  
      // Filter based on goodZipCodes if provided
      if (goodZipCodes && goodZipCodes.length > 0) {
        data = data.filter(item => goodZipCodes.includes(item.zipcode));
      }
  
      // Filtering based on searchKey
      if (options.searchKey) {
        data = data.filter(item => {
          return (
            Object.values(item).some(value =>
              String(value).toLowerCase().includes(options.searchKey.toLowerCase())
            )
          );
        });
      }
  
      // Filtering based on agent, call_result, or updated_at if provided
      if (options.filters) {
        if (options.filters.agent) {
          data = data.filter(item => item.agent === options.filters.agent);
        }
  
        if (options.filters.call_result) {
          data = data.filter(item => item.call_result === options.filters.call_result);
        }
  
        if (options.filters.updated_at) {
          const filterDate = new Date(options.filters.updated_at);
          data = data.filter(item => {
            const itemDate = new Date(item.updated_at);
            return itemDate.getTime() === filterDate.getTime();
          });
        }
      }
  
      // Sorting
      if (options.orderBy) {
        data.sort((a, b) => {
          const order = options.orderDirection === 'DESC' ? -1 : 1;
          return a[options.orderBy] > b[options.orderBy] ? order : -order;
        });
      }
  
      // Pagination
      const total = data.length;
      const startIndex = (options.page - 1) * options.limit;
      const endIndex = startIndex + options.limit;
      const paginatedData = data.slice(startIndex, endIndex);
  
      return {
        data: paginatedData,
        total,
        page: options.page,
        limit: options.limit,
        hasNext: endIndex < total,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to paginate campaign data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async updateCallResult(campaignDataId: string, recordId: string, agentId: string, callResult: CallResultEnum, rescheduledDate?: Date): Promise<void> {
    try {
      
      const campaignData = await this.campaignDataRepository.findOne({
        where: { id: campaignDataId },
        relations: ['campaign'], // Include the 'campaign' relation
      });
  
      if (!campaignData) {
        throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
      }
  
      const record = campaignData.data.find(item => item.id === recordId);
  
      if (!record) {
        throw new HttpException('Record not found', HttpStatus.NOT_FOUND);
      }
  
      record.agent = agentId;
      record.call_result = callResult;
      record.updated_at = new Date();
  
      if (callResult === CallResultEnum.RE_SCHEDULE && rescheduledDate) {
        await this.rescheduledCallService.create({
          campaign: campaignData.campaign.id,
          preprocessedData: campaignDataId,
          recordId: recordId,
          scheduledDate: rescheduledDate,
        });
      }
  
      await this.campaignDataRepository.save(campaignData);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to update call result',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async downloadCampaignDataAsCsv(id: string): Promise<string> {
    try {
      const campaignData = await this.campaignDataRepository.findOne({
        where: { id },
      });

      if (!campaignData) {
        throw new HttpException('Campaign data not found', HttpStatus.NOT_FOUND);
      }

      const data = campaignData.data || [];

      // If data is empty
      if (data.length === 0) {
        throw new HttpException('No data available to download', HttpStatus.NO_CONTENT);
      }

      // Create CSV Stringifier
      const csvStringifier = createObjectCsvStringifier({
        header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
      });

      // Generate CSV content
      const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(data);

      return csvContent;
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to download campaign data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  
}

  
