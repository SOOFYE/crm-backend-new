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



  // async findOne(criteria: FindOptionsWhere<CampaignDataEntity>): Promise<CampaignDataEntity> {
  //   try {
  //     const user = await this.campaignDataRepository.findOne({ where: criteria });
  //     return user;
  //   } catch (error) {
      
  //     console.log(error)
      
  //     throw new HttpException(
  //       {
  //         status: HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: 'Error fetching user',
  //       },
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }




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

  
}

  
