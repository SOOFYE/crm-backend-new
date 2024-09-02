import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { CampaignType } from './entities/campaign-type.entity';
import { CreateCampaignTypeDto } from './dto/create-campaign-type.dto';
import { UpdateCampaignTypeDto } from './dto/update-campaign-type.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';

@Injectable()
export class CampaignTypesService {
  constructor(
    @InjectRepository(CampaignType)
    private readonly campaignTypeRepository: Repository<CampaignType>,
    private readonly paginationUtil: PaginationUtil,
  ) {}

  async create(createCampaignTypeDto: CreateCampaignTypeDto): Promise<CampaignType> {
    try {
      const campaignType = this.campaignTypeRepository.create(createCampaignTypeDto);
      return await this.campaignTypeRepository.save(campaignType);
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to create campaign type',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(options: PaginationOptions<CampaignType>): Promise<PaginationResult<CampaignType>> {
    try {
      
      return await this.paginationUtil.paginate(this.campaignTypeRepository, options);
    } catch (error) {
      console.log(error)
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to retrieve campaign types',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(criteria: FindOptionsWhere<CampaignType>): Promise<CampaignType> {
    try {
      const campaignType = await this.campaignTypeRepository.findOne({ where: criteria });
      if (!campaignType) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: `Campaign type not found with the provided criteria`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return campaignType;
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.response || 'Failed to retrieve campaign type',
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: string, updateCampaignTypeDto: UpdateCampaignTypeDto): Promise<CampaignType> {
    try {
      const campaignType = await this.campaignTypeRepository.preload({
        id,
        ...updateCampaignTypeDto,
      });
      if (!campaignType) {
        throw new HttpException(
          {
            status: HttpStatus.NOT_FOUND,
            error: `Campaign type with ID ${id} not found`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return await this.campaignTypeRepository.save(campaignType);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.response || `Failed to update campaign type with ID ${id}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const campaignType = await this.findOne({ id });
      await this.campaignTypeRepository.softRemove(campaignType);
    } catch (error) {
      throw new HttpException(
        {
          status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.response || `Failed to delete campaign type with ID ${id}`,
        },
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
