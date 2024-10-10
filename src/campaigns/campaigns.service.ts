import { Injectable, HttpException, HttpStatus, NotFoundException, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CampaignDataEntity } from "../campaign-data/entities/campaign-datum.entity";
import { UserEntity } from "../users/entities/user.entity";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { UpdateCampaignDto } from "./dto/update-campaign.dto";
import { CampaignEntity } from "./entities/campaign.entity";
import { PaginationUtil } from "../utils/pagination.util";
import { PaginationOptions } from "../common/interfaces/pagination-options.interface";
import { PaginationResult } from "../common/interfaces/pagination-result.interface";
import { GetAllCampaignsDto } from "./dto/GetAllCampaigns.dto";
import { CampaignDataService } from "../campaign-data/campaign-data.service";
import { CampaignTypeEntity } from "../campaign-types/entities/campaign-type.entity";
import * as csvParser from 'csv-parser';
import * as streamifier from 'streamifier';
import { stringify } from 'csv-stringify/sync'; 
import { FormEntity } from "../forms/entities/form.entity";
import { plainToClass } from "class-transformer";
import { CampaignStatusEnum } from "../common/enums/campaign-stats.enum";



@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,

    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @InjectRepository(CampaignDataEntity)
    private campaignDataRepository: Repository<CampaignDataEntity>,

    @InjectRepository(CampaignTypeEntity)
    private campaignTypeRepository: Repository<CampaignTypeEntity>,

    @InjectRepository(FormEntity)
    private formRepository: Repository<FormEntity>,

    private readonly paginationUtil: PaginationUtil

  ) {}

  async createCampaign(createCampaignDto: CreateCampaignDto): Promise<CampaignEntity> {
    try {
      const { name, description, status, agentIds, campaignTypeId, formId, processedDataIds } = createCampaignDto;

      // Fetch the agents associated with this campaign
      const agents = await this.userRepository.findBy({
      id: In(agentIds),
    });

      if (agents.length !== agentIds.length) {
        throw new HttpException('Some agents not found', HttpStatus.NOT_FOUND);
      }

      // Fetch the campaign type
      const campaignType = await this.campaignTypeRepository.findOne({ where: { id: campaignTypeId } });
      if (!campaignType) {
        throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
      }

      // Fetch the form if provided
      let form = null;
      if (formId) {
        form = await this.formRepository.findOne({ where: { id: formId } });
        if (!form) {
          throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
        }
      }

      // Fetch the processed campaign data if provided
      let processedData = [];
      if (processedDataIds && processedDataIds.length > 0) {
        processedData = await this.campaignDataRepository.findByIds(processedDataIds);
        if (processedData.length !== processedDataIds.length) {
          throw new HttpException('Some campaign data not found', HttpStatus.NOT_FOUND);
        }
      }

      // Create the new campaign entity
      const campaign = this.campaignRepository.create({
        name,
        description,
        status,
        agents,
        campaignType,
        form,
        processedData,
      });

      // Save the new campaign to the database
      return await this.campaignRepository.save(campaign);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to create campaign', HttpStatus.INTERNAL_SERVER_ERROR);
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

      const campaigns = this.paginationUtil.paginate(this.campaignRepository, options, {
        alias: 'campaign',
        relations: {
          campaignType: 'campaignType',
          agents: 'agents',
        },
      });

      return campaigns
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

    async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto): Promise<CampaignEntity> {

      console.log(id,updateCampaignDto)
      try {
        const { name, description, status, agentIds, campaignTypeId, formId, processedDataIds } = updateCampaignDto;

        console.log()
    
        // Fetch the campaign to be updated
        const campaign = await this.campaignRepository.findOne({ where: { id }, relations: ['agents', 'campaignType', 'form', 'processedData'] });
        if (!campaign) {
          throw new NotFoundException('Campaign not found');
        }
    
        // Update fields
        if (name) campaign.name = name;
        if (description) campaign.description = description;
        if (status) campaign.status = status;
    
        // Update agents if provided
        if (agentIds) {
          const agents = await this.userRepository.findBy({ id: In(agentIds) });
          if (agents.length !== agentIds.length) {
            throw new HttpException('Some agents not found', HttpStatus.NOT_FOUND);
          }
          campaign.agents = agents;
        }
    
        // Update campaign type if provided
        if (campaignTypeId) {
          const campaignType = await this.campaignTypeRepository.findOne({ where: { id: campaignTypeId } });
          if (!campaignType) {
            throw new HttpException('Campaign type not found', HttpStatus.NOT_FOUND);
          }
          campaign.campaignType = campaignType;
        }
    
        // Update form if provided
        if (formId) {
          const form = await this.formRepository.findOne({ where: { id: formId } });
          if (!form) {
            throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
          }
          campaign.form = form;
        }
    
        // Update processed data if provided
        if (processedDataIds) {
          const processedData = await this.campaignDataRepository.findByIds(processedDataIds);
          if (processedData.length !== processedDataIds.length) {
            throw new HttpException('Some campaign data not found', HttpStatus.NOT_FOUND);
          }
          campaign.processedData = processedData;
        }
    
        // Save the updated campaign
        return await this.campaignRepository.save(campaign);
      } catch (error) {
        throw new HttpException(error.message || 'Failed to update campaign', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }


    async getCampaignById(id: string): Promise<CampaignEntity> {
      try {
        const campaign = await this.campaignRepository.findOne({
          where: { id },
          relations: ['agents', 'campaignType', 'form', 'processedData'], // Include relevant relations
        });
    
        if (!campaign) {
          throw new NotFoundException('Campaign not found');
        }
    
        return plainToClass(CampaignEntity, campaign);;
      } catch (error) {
        throw new HttpException(
          error.message || 'Failed to fetch campaign',
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }




    async verifyAgentAccess(agentId: string, campaignId: string): Promise<boolean> {
      const campaign = await this.campaignRepository.findOne({
        where: { id: campaignId },
        relations: ['agents'],
      });
    
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }
    
      // Check if the agent is part of this campaign
      const isAgentInCampaign = campaign.agents.some(agent => agent.id === agentId);
      if (!isAgentInCampaign) {
        throw new ForbiddenException('Agent is not part of this campaign');
      }
    
      return true;
    }



    async getActiveCampaignsForAgent(agentId: string): Promise<CampaignEntity[]> {
      const campaigns = await this.campaignRepository.find({
        where: {
          status: CampaignStatusEnum.ACTIVE,
          agents: { id: agentId },  // Filter campaigns assigned to this agent
        },
        relations: ['agents', 'form'],  // Include relations to check for agents and form details
      });
    
      // If no campaigns are found, simply return an empty array without throwing an exception
      return campaigns || [];
    }


 

}

