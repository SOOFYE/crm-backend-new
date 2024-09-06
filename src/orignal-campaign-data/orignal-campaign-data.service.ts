import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OriginalCampaignData } from './entities/orignal-campaign-datum.entity';
import { CampaignData } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignTypesService } from '../campaign-types/campaign-types.service';
import { CampaignDataEnum } from '../common/enums/campaign-dataum.enum';
import { JobService } from '../job-service/job-service.service';
import { S3Service } from '../s3/s3.service';
import { PaginationUtil } from '../utils/pagination.util';
import { FindAllCampaignDataDto } from './dto/find-all-ogcamp.dto';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';

@Injectable()
export class OriginalCampaignDataService {
  constructor(
    @InjectRepository(OriginalCampaignData)
    private readonly originalDataRepository: Repository<OriginalCampaignData>,
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    @InjectRepository(CampaignEntity)
    private readonly campaignsRepository: Repository<CampaignEntity>,
    private readonly s3Service: S3Service,
    private readonly jobService: JobService, // Replace this with your actual job service implementation
    private readonly campaignTypeService: CampaignTypesService,
    private readonly paginationUtil: PaginationUtil
  ) {}

  async uploadOriginalData(file: Express.Multer.File, campaignTypeId: string, duplicateFieldCheck: string): Promise<OriginalCampaignData> {
    const fieldsToCheck = duplicateFieldCheck.split(',').map(field => field.trim()); // Convert to array
    try {
      const {s3Url,baseName,ext} = await this.s3Service.uploadFile(process.env.ORIGINAL_DATA_DIR, file);
  
      const campaignType = await this.campaignTypeService.findOne({ id: campaignTypeId });
      if (!campaignType) {
        throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
      }
  
      const originalData = this.originalDataRepository.create({
        name: baseName+ext,
        s3Url:s3Url,
        duplicateFieldCheck: fieldsToCheck,
        campaignType,
      });
  
      const savedOriginalData = await this.originalDataRepository.save(originalData);
  
      // Create an initial CampaignData record with empty fields
      const initialCampaignData = this.campaignDataRepository.create({
        name: baseName,
        status: CampaignDataEnum.PENDING,  // Initial status is PENDING
        campaignType: campaignType,
        originalData: savedOriginalData
      });
  
      const savedCampaignData = await this.campaignDataRepository.save(initialCampaignData);
  
      // Link original data to this initial processed data
      savedOriginalData.preprocessedData = savedCampaignData;
      await this.originalDataRepository.save(savedOriginalData);
  
      // Queue a background job to process the uploaded data
      await this.jobService.queueJob({
        type: 'processOriginalData',
        data: { originalDataId: savedOriginalData.id, campaignTypeId, duplicateFieldCheck: fieldsToCheck, campaignDataId: savedCampaignData.id,baseName,ext },
      });
  
      return savedOriginalData;
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to upload original data',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findAll(query: FindAllCampaignDataDto) {
    try {
      const paginationOptions: PaginationOptions<OriginalCampaignData> = {
        page: query.page,
        limit: query.limit,
        searchKey: query.searchKey,
        searchField: query.searchField,
        filters: query.filters,
        orderBy: query.orderBy,
        orderDirection: query.orderDirection,

        
      };

  
      return this.paginationUtil.paginate(this.originalDataRepository, paginationOptions, {
        alias: 'originalData',
        relations: {
          campaignType: 'campaignType',
          preprocessedData: {
            alias: 'preprocessedData',
            fields: ['id', 'name', 'status', 's3Url', 'duplicateStatsS3Url', 'replicatedStatsS3Url'],
            relations: { 
              campaign: {
                alias: 'campaign',
                fields: ['id', 'name'], // Add relevant fields you need from the campaign
              },
            },
          },
        },
      });
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to retrieve original campaign data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async deleteUploadedData(id: OriginalCampaignData['id']): Promise<void> {
    try {
      // Find the original data with related preprocessed data
      const originalData = await this.originalDataRepository.findOne({
        where: { id },
        relations: ['preprocessedData'],
      });
  
      if (!originalData) {
        throw new HttpException('Original campaign data not found', HttpStatus.NOT_FOUND);
      }
  
      const preprocessedData = originalData.preprocessedData;
  
      // If there's associated preprocessed data, soft delete it and unlink from any campaign
      if (preprocessedData) {
        const campaignData = preprocessedData;
  
        // Unlink the campaignData from any associated campaign
        if (campaignData.campaign) {
          // Unlink the processedData from the campaign entity
          const campaign = campaignData.campaign;
          campaign.processedData = null;
          campaignData.campaign = null;
  
          // Save the campaign entity after unlinking
          await this.campaignsRepository.save(campaign);
        }
  
        // Soft delete the campaignData
        await this.campaignDataRepository.softDelete(campaignData.id);
      }
  
      // Soft delete the original data
      await this.originalDataRepository.softDelete(id);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to delete uploaded data',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }




}
