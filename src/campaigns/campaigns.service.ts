import { Injectable, HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
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
import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import { promisify } from 'util';
import { PaginateCampaignDataDto } from "../campaign-data/dto/PaginateCampaignData.dto";
import { CampaignDataService } from "../campaign-data/campaign-data.service";

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(CampaignEntity)
    private readonly campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly paginationUtil: PaginationUtil,
    private readonly campaignDataService : CampaignDataService
  ) {}

  async createCampaign(createCampaignDto: CreateCampaignDto, zipCodeFile: Express.Multer.File): Promise<CampaignEntity> {
    const { name, description, processedDataId, status, agents } = createCampaignDto;

    const processedData = await this.campaignDataRepository.findOne({
      where: { id: processedDataId, status: CampaignDataEnum.SUCCESS },
    });
    if (!processedData) {
      throw new HttpException('Processed data not found or not in SUCCESS status', HttpStatus.BAD_REQUEST);
    }

    const linkedAgents = await this.userRepository.findByIds(agents);
    if (linkedAgents.length !== agents.length) {
      throw new HttpException('Some agents not found', HttpStatus.BAD_REQUEST);
    }

    let goodZipCodes = [];
    if (zipCodeFile) {
      goodZipCodes = await this.parseZipCodeFile(zipCodeFile);
    }

    const campaign = this.campaignRepository.create({
      name,
      description,
      status,
      processedData,
      agents: linkedAgents,
      goodZipCodes,
    });

    return this.campaignRepository.save(campaign);
  }

  private async parseZipCodeFile(file: Express.Multer.File): Promise<string[]> {
    const parseCsv = promisify(csvParser);
    const goodZipCodes: string[] = [];

    const stream = fs.createReadStream(file.path).pipe(csvParser());
    for await (const row of stream) {
      goodZipCodes.push(row['good_zipcodes']);  // Adjust this based on your file structure
    }

    return goodZipCodes;
  }

  async getFilteredPreprocessedData(campaignId: string, paginationOptions: PaginateCampaignDataDto) {
    const campaign = await this.campaignRepository.findOne({
      where: { id: campaignId },
      relations: ['processedData'],
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    const goodZipCodes = campaign.goodZipCodes;

    return this.campaignDataService.paginateCampaignData(campaign.processedData.id, paginationOptions, goodZipCodes);
  }


  async updateCampaign(id: string, updateCampaignDto: UpdateCampaignDto): Promise<CampaignEntity> {
    try {
      const campaign = await this.campaignRepository.findOne({ where: { id }, relations: ['processedData', 'agents'] });
      
      if (!campaign) {
        throw new NotFoundException('Campaign not found');
      }

      if (updateCampaignDto.name !== undefined) {
        campaign.name = updateCampaignDto.name;
      }

      if (updateCampaignDto.description !== undefined) {
        campaign.description = updateCampaignDto.description;
      }

      if (updateCampaignDto.agents !== undefined) {
        // Update agents logic here
        const linkedAgents = await this.userRepository.findByIds(updateCampaignDto.agents);
        if (linkedAgents.length !== updateCampaignDto.agents.length) {
          throw new HttpException('Some agents not found', HttpStatus.BAD_REQUEST);
        }
        campaign.agents = linkedAgents;
      }

      if (updateCampaignDto.status !== undefined) {
        if (campaign.processedData?.status === CampaignDataEnum.SUCCESS) {
          campaign.status = updateCampaignDto.status;
        } else {
          throw new HttpException('Cannot update campaign status unless processed data is successful.', HttpStatus.BAD_REQUEST);
        }
      }

      return await this.campaignRepository.save(campaign);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to update campaign',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getOneCampaign(id: string): Promise<CampaignEntity> {
    const campaign = await this.campaignRepository.findOne({
      where: { id },
      relations: ['processedData', 'agents', 'type'],
      select: {
        processedData: {
          id: true, // Include other fields as needed, but exclude `data`
          name: true,
          s3Url: true,
          status: true,
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async getAllCampaigns(paginationOptions: GetAllCampaignsDto): Promise<PaginationResult<CampaignEntity>> {
    return this.paginationUtil.paginate(this.campaignRepository, paginationOptions, {
      alias: 'campaign',
      relations: {
        processedData: {
          alias: 'processedData',
          fields: ['id', 'name', 's3Url', 'status'], // Specify fields to select from processedData
        },
        agents: 'agents',
        type: 'type',
      },
    });
  }

  async getCampaignsByAgent(agentId: string, paginationOptions: PaginationOptions<CampaignEntity>): Promise<PaginationResult<CampaignEntity>> {
    const agent = await this.userRepository.findOne({ where: { id: agentId } });
  
    if (!agent) {
      throw new NotFoundException('Agent not found');
    }
  
    return this.paginationUtil.paginate(this.campaignRepository, paginationOptions, {
      alias: 'campaign',
      relations: {
        processedData: {
          alias: 'processedData',
          fields: ['id', 'name', 's3Url', 'status'], // Specify fields to select from processedData
        },
        agents: 'agents',
        type: 'type',
      },
      where: qb => {
        qb.andWhere('agents.id = :agentId', { agentId });
      },
    });
  }



}