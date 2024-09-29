import { Injectable, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CampaignData } from "../campaign-data/entities/campaign-datum.entity";
import { CampaignDataEnum } from "../common/enums/campaign-dataum.enum";
import { UserEntity } from "../users/entities/user.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { CampaignEntity } from "./entities/campaign.entity";
import { PaginationUtil } from "../utils/pagination.util";
import { PaginationOptions } from "../common/interfaces/pagination-options.interface";
import { PaginationResult } from "../common/interfaces/pagination-result.interface";
import { GetAllCampaignsDto } from "./dto/GetAllCampaigns.dto";
import * as fs from 'fs';
import { promisify } from 'util';
import { PaginateCampaignDataDto } from "../campaign-data/dto/PaginateCampaignData.dto";
import { CampaignDataService } from "../campaign-data/campaign-data.service";
import { CampaignType } from "../campaign-types/entities/campaign-type.entity";
import * as csvParser from 'csv-parser';
import * as streamifier from 'streamifier';
import { stringify } from 'csv-stringify/sync'; 
import { S3Service } from "../s3/s3.service";
import { AgentEntity } from "../agents/entities/agent.entity";


@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(CampaignType)
    private readonly campaignTypeRepository: Repository<CampaignType>,
    private readonly paginationUtil: PaginationUtil,
    private readonly campaignDataService : CampaignDataService,
    private readonly s3Service: S3Service

  ) {}

  async createCampaign(
    createCampaignDto: CreateCampaignDto,
    csvFile?: Express.Multer.File
  ): Promise<CampaignEntity> {

    const { name, description, status, agents: agentIds, campaignTypeId, filterField, additionalFields } = createCampaignDto;
  
    // Step 1: Find the Campaign Type
    const campaignType = await this.campaignTypeRepository.findOne({ where: { id: campaignTypeId } });
    if (!campaignType) {
      throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
    }
  
    // Step 2: Find the agents by their IDs
    const agents = await this.userRepository.findBy({
      id: In(agentIds),
    });
  
    if (agents.length !== agentIds.length) {
      throw new HttpException('One or more agents not found', HttpStatus.NOT_FOUND);
    }
  
    // Step 3: Parse the CSV file to generate the filter criteria
    let filterCriteria = null;
    if (csvFile) {
      filterCriteria = await this.generateFilterCriteriaFromCsv(csvFile);
    }
  
    // Step 4: Handle optional fields (set to null if empty or undefined)
    const sanitizedFilterField = filterField && filterField.length ? filterField : null;
    const sanitizedAdditionalFields = additionalFields && additionalFields.length ? additionalFields : null;
  
    // Step 5: Create a new Campaign entity
    const campaign = this.campaignRepository.create({
      name,
      description,
      status,
      agents,
      filterField: sanitizedFilterField,
      filterCriteria,
      additionalFields: sanitizedAdditionalFields,
      campaignType,
    });
  
    // Step 6: Save the Campaign entity
    return this.campaignRepository.save(campaign);
  }

  private async generateFilterCriteriaFromCsv(csvFile: Express.Multer.File): Promise<Record<string, string[]>> {
    try {
      const filterCriteria: Record<string, string[]> = {};
  
      // Use streamifier to convert buffer to a readable stream if the file is uploaded in-memory
      const stream = streamifier.createReadStream(csvFile.buffer).pipe(csvParser());
  
      for await (const row of stream) {
        for (const [key, value] of Object.entries(row)) {
          if (!filterCriteria[key]) {
            filterCriteria[key] = [];
          }
          filterCriteria[key].push(value.toString());
        }
      }
  
      return filterCriteria;
    } catch (error) {
      console.log(error);
      throw new HttpException('Failed to parse CSV file for filter criteria', HttpStatus.BAD_REQUEST);
    }
  }


  async getAllCampaignIdsAndNames(): Promise<CampaignEntity[]> {
    try {
      const campaigns =  this.campaignRepository.find({
        select: ['id', 'name'],
      });
      return campaigns;
    } catch (error) {
      throw new Error(`Failed to get campaigns: ${error.message}`);
    }
  }


  async getAllCampaigns(options: GetAllCampaignsDto):Promise<PaginationResult<CampaignEntity>> {

      return this.paginationUtil.paginate(this.campaignRepository, options, {
        alias: 'campaign',
        relations: {
          campaignType: 'campaignType',
          agents: 'agents',
        },
      });
    } catch (error) {
      console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to retrieve campaigns',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );

      
    }


    async getFilteredData(
      campaignId: string,
      options: PaginationOptions<any>,
    ) {
      try{
      // Fetch the campaign by ID
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
      });
  
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }
  
      const filteredData = campaign.filteredData || [];

  
      // Apply dynamic pagination, searching, filtering, and sorting using PaginationUtil
      return this.paginationUtil.paginateArray(filteredData, options);
    }catch(error){
      console.log(error)
      throw error
    }

    }

    async getSingleCampaign(campaignId: string): Promise<CampaignEntity> {
      try {
        // Find the campaign and explicitly exclude the 'filteredData' field
        const campaign = await this.campaignRepository
          .createQueryBuilder('campaign')
          .leftJoinAndSelect('campaign.campaignType', 'campaignType')
          .leftJoinAndSelect('campaign.agents', 'agents')
          .leftJoinAndSelect('campaign.processedData', 'processedData')
          .select([
            'campaign.id',
            'campaign.name',
            'campaign.description',
            'campaign.status',
            'campaign.filterField',
            'campaign.filterCriteria',
            'campaign.additionalFields',
            'campaignType.id',
            'campaignType.name',
            'agents.id',
            'agents.firstname',
            'agents.lastname',
            'agents.username',
            'processedData.id',
            'processedData.name',
            'processedData.s3Url',
            // 'processedData.status',
          ]) // Explicitly selecting fields excluding 'filteredData'
          .where('campaign.id = :campaignId', { campaignId })
          .getOne();
  
        if (!campaign) {
          throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
        }
  
        return campaign;
      } catch (error) {
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message || 'Failed to retrieve campaign',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    async getFilteredDataAsCsv(campaignId: string): Promise<string> {
      try {
        // Step 1: Fetch campaign and its filtered data
        const campaign = await this.campaignRepository.findOne({
          where: { id: campaignId },
          select: ['id', 'name', 'filteredData'], // Only selecting relevant fields
        });
  
        if (!campaign) {
          throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
        }
  
        if (!campaign.filteredData || campaign.filteredData.length === 0) {
          throw new HttpException('No filtered data available', HttpStatus.NO_CONTENT);
        }
  
        // Step 2: Convert filteredData to CSV
        return this.convertFilteredDataToCsv(campaign.filteredData);
      } catch (error) {
        throw new HttpException(
          {
            status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message || 'Failed to generate CSV',
          },
          error.status || HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  
    private convertFilteredDataToCsv(data: any[]): string {
      if (data.length === 0) {
        throw new HttpException('No data to convert to CSV', HttpStatus.BAD_REQUEST);
      }
  
      const headers = Object.keys(data[0]); // Extract headers from the first object
      const csvString = stringify(data, {
        header: true,
        columns: headers,
      });
  
      return csvString;
    }


    // async updateCampaign(
    //   campaignId: string,
    //   updateCampaignDto: UpdateCampaignDto,
    //   csvFile?: Express.Multer.File,
    // ): Promise<CampaignEntity> {
    //   const { name, description, status, agents: agentIds, filterField, additionalFields } = updateCampaignDto;
    
    //   // Step 1: Fetch the existing campaign
    //   const campaign = await this.campaignRepository.findOne({
    //     where: { id: campaignId },
    //     relations: ['agents', 'campaignType'],
    //   });
    
    //   if (!campaign) {
    //     throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
    //   }
    
    //   // Step 2: Check if agents need to be updated
    //   let agents = campaign.agents;
    //   if (agentIds) {
    //     agents  = await this.userRepository.findBy({ id: In(agentIds) });
    
    //     if (agents.length !== agentIds.length) {
    //       throw new HttpException('One or more agents not found', HttpStatus.NOT_FOUND);
    //     }
    //   }
    
    //   // Step 3: Update campaign fields
    //   campaign.name = name ?? campaign.name;
    //   campaign.description = description ?? campaign.description;
    //   campaign.status = status ?? campaign.status;
    //   campaign.agents = agents;
    
    //   let filterCriteria = campaign.filterCriteria;
    //   let isFilterChanged = false;
    
    //   // Step 4: Update filter fields and re-process data if needed
    //   if (filterField && JSON.stringify(filterField) !== JSON.stringify(campaign.filterField)) {
    //     isFilterChanged = true;
    //     campaign.filterField = filterField;
    //   }
    
    //   // Step 5: If CSV file is provided, update filter criteria and reprocess data
    //   if (csvFile) {
    //     filterCriteria = await this.generateFilterCriteriaFromCsv(csvFile);
    //     campaign.filterCriteria = filterCriteria;
    //     isFilterChanged = true;
    //   }
    
    //   // Step 6: Re-process the filtered data if filter fields or criteria have changed
    //   if (isFilterChanged) {
    //     const processedData = await this.campaignDataRepository.findOne({
    //       where: { campaign: { id: campaign.id } },
    //     });
    
    //     if (processedData && processedData.data) {
    //       const newFilteredData = this.campaignDataService.processFilterCriteria(processedData.data, campaign.filterField, filterCriteria);
    //       campaign.filteredData = newFilteredData;
    //     }
    //   }
    
    //   // Step 7: Update additional fields if provided
    //   if (additionalFields) {
    //     campaign.additionalFields = additionalFields;
    //   }
    
    //   // Step 8: Save the updated campaign
    //   return this.campaignRepository.save(campaign);
    // }
    


    async deleteCampaign(campaignId: CampaignEntity['id']): Promise<void> {
      try {
        // Step 1: Find the campaign
        const campaign = await this.campaignRepository.findOne({
          where: { id: campaignId },
          relations: ['processedData'], // Get processed data relation
        });
    
        if (!campaign) {
          throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
        }
    
        // Step 2: Check if there is processed data linked
        if (campaign.processedData) {
          // Step 3: Unlink the processed data using the unlink method in CampaignDataService
          await this.campaignDataService.unLinkCampaign(campaign.processedData.id);
        }
    
        // Step 4: Soft delete the campaign
        await this.campaignRepository.softDelete(campaignId);
      } catch (error) {
        // Return proper HTTP status code and error message
        if (error instanceof HttpException) {
          // If it's an HttpException, rethrow it with the original status and message
          throw error;
        }
    
        // For other errors, return a generic 500 Internal Server Error
        throw new HttpException(
          {
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            error: error.message || 'Failed to delete campaign',
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

}

