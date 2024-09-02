import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RescheduledCallEntity } from './entities/rescheduled-call.entity';
import { CreateRescheduledCallDto } from './dto/create-rescheduled-call.dto';
import { CampaignData } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { FindAllRescheduledCallsDto } from './dto/find-all.dto';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';
import { PaginationUtil } from '../utils/pagination.util';

@Injectable()
export class RescheduledCallsService {
  constructor(
    @InjectRepository(RescheduledCallEntity)
    private readonly rescheduledCallRepository: Repository<RescheduledCallEntity>,
    @InjectRepository(CampaignEntity)
    private readonly campaignRepository: Repository<CampaignEntity>,
    @InjectRepository(CampaignData)
    private readonly campaignDataRepository: Repository<CampaignData>,
    private readonly paginationUtil: PaginationUtil
  ) {}

  async create(createRescheduledCallDto: CreateRescheduledCallDto): Promise<RescheduledCallEntity> {
    try {
      // Load the related entities using the IDs
      const campaign = await this.campaignRepository.findOne({ where: { id: createRescheduledCallDto.campaign } });
      if (!campaign) {
        throw new HttpException('Campaign not found', HttpStatus.NOT_FOUND);
      }

      const preprocessedData = await this.campaignDataRepository.findOne({ where: { id: createRescheduledCallDto.preprocessedData } });
      if (!preprocessedData) {
        throw new HttpException('Preprocessed data not found', HttpStatus.NOT_FOUND);
      }

      // Create the rescheduled call entity
      const rescheduledCall = this.rescheduledCallRepository.create({
        ...createRescheduledCallDto,
        campaign,
        preprocessedData,
      });

      return this.rescheduledCallRepository.save(rescheduledCall);
    } catch (error) {
      throw new HttpException('Failed to create rescheduled call', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findById(id: string): Promise<RescheduledCallEntity> {
    const rescheduledCall = await this.rescheduledCallRepository.findOne({ where: { id } });
    if (!rescheduledCall) {
      throw new HttpException('Rescheduled call not found', HttpStatus.NOT_FOUND);
    }
    return rescheduledCall;
  }

  async findAll(options: FindAllRescheduledCallsDto): Promise<PaginationResult<RescheduledCallEntity>> {
    try {
      return this.paginationUtil.paginate(this.rescheduledCallRepository, options, {
        alias: 'rescheduledCall',
        relations: {
          campaign: 'campaign',
          preprocessedData: 'preprocessedData',
        },
      });
    } catch (error) {
      throw new HttpException('Failed to retrieve rescheduled calls', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
