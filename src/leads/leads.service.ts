import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadEntity } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaignDataService } from '../campaign-data/campaign-data.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { UsersService } from '../users/users.service';
import { Between, Repository, SelectQueryBuilder } from 'typeorm';
import { LeadStatusEnum } from '../common/enums/lead-status.enum';
import { FormsService } from '../forms/forms.service';
import { PaginationUtil } from '../utils/pagination.util';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';
import { LeadsPaginationOptionsDto } from './dto/get-all-leads.dto';
import { classToPlain, instanceToPlain } from 'class-transformer';


@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(LeadEntity)
    private leadRepository: Repository<LeadEntity>,
    private campaignsService: CampaignsService,
    private usersService: UsersService,
    private campaignDataService: CampaignDataService,
    private formService: FormsService,
    private paginationUtil: PaginationUtil
  ) {}

  async createLead(agentId: string, createLeadDto: any): Promise<LeadEntity> {
    const { campaignId, formId, processedDataId, selectedProducts, phoneNumberLead,...formFields } = createLeadDto;
    console.log(createLeadDto)
    // const formFields = createLeadDto.formData;

    // Validate mandatory fields
    if (!campaignId || !formId || !agentId || !phoneNumberLead) {
      throw new BadRequestException('Missing required fields.');
    }

    const campaign = await this.campaignsService.getCampaignById(campaignId);
    if (!campaign) {
      throw new BadRequestException('Invalid campaign ID.');
    }

    const agent = await this.usersService.findOne({ id: agentId });
    if (!agent) {
      throw new BadRequestException('Invalid agent ID.');
    }

    const processedData = await this.campaignDataService.findOne({ id: processedDataId });
    if (!processedData) {
      throw new BadRequestException('Invalid processed data ID.');
    }

    const form = await this.formService.findOne({ id: formId });
    if (!form) {
      throw new BadRequestException('Invalid form ID.');
    }

    // Calculate revenue based on selected products
    const revenue = this.calculateRevenue(form, selectedProducts);


    // Validate that revenue does not exceed the database limit (99999999.99)
    if (revenue > 99999999.99) {
      throw new BadRequestException('Calculated revenue exceeds the maximum allowed value.');
    }

    // Create a new lead with formData and selectedProducts stored separately
    const lead = this.leadRepository.create({
      phoneNumber: phoneNumberLead,
      campaign,
      agent,
      form,
      processedData,
      formData: formFields, // Nested form data including "Other" fields
      selectedProducts,
      revenue: revenue, 
      status: LeadStatusEnum.PENDING,
    });

    return await this.leadRepository.save(lead);
  }

  async updateLead(leadId: string, updateLeadDto: any): Promise<LeadEntity> {
    const { selectedProducts, phoneNumberLead, ...formFields } = updateLeadDto;

    // Fetch the lead entity by lead ID
    const lead = await this.leadRepository.findOne({ where: { id: leadId }, relations: ['form'] });
    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    // Update the form fields
    lead.formData = { ...lead.formData, ...formFields };

    // Update the phone number
    if (phoneNumberLead) {
      lead.phoneNumber = phoneNumberLead;
    }


    const revenue = this.calculateRevenue(lead.form, selectedProducts);
    lead.revenue = revenue;
    
    // Save updated lead
    return await this.leadRepository.save(lead);
  }


  calculateRevenue(form: any, selectedProducts: string[]): number {
    let revenue = 0;
    if (selectedProducts && selectedProducts.length > 0) {
      selectedProducts.forEach((productName: string) => {
        const product = form.productsAndPrices.find(p => p.name === productName);
        if (product) {
          const price = parseFloat(product.price);
          if (!isNaN(price)) {
            revenue += price;
          }
        }
      });
    }
    return parseFloat(revenue.toFixed(2)); // Ensure revenue has two decimal places
  }

  async updateLeadStatus(leadId: string, newStatus: LeadStatusEnum): Promise<LeadEntity> {
    // Find the lead by ID
    const lead = await this.leadRepository.findOne({ where: { id: leadId } });

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    // Update the status
    lead.status = newStatus;

    // Save the updated lead
    return await this.leadRepository.save(lead);
  }





  async getPaginatedLeads(
    campaignIds: string[], // Filter by multiple campaign IDs
    formId?: string,       // Optionally filter by form
    lists?: string[],      // Optionally filter by lists (leads assigned to specific lists)
    dateRange?: { start: Date, end: Date },  // Optionally filter by date range
    phoneNumber?: string,  // Optionally search by phone number
    agentIds?: string[],   // Optionally filter by agent names
    statuses?: LeadStatusEnum[], // Optionally filter by lead statuses
    paginationOptions?: LeadsPaginationOptionsDto, // Custom pagination options
  ): Promise<any> {

    console.log(phoneNumber)

    const joinOptions = {
      alias: 'lead',
      relations: {
        campaign: 'campaign',
        agent: 'agent',  // Join agent to allow agent name filtering
        form: 'form',
        processedData: 'processedData',
      },
      where: (qb: SelectQueryBuilder<LeadEntity>) => {
        if (campaignIds && campaignIds.length > 0) {
          qb.andWhere('campaign.id IN (:...campaignIds)', { campaignIds });
        }
  
        if (formId) {
          qb.andWhere('form.id = :formId', { formId });
        }
  
        if (lists && lists.length > 0) {
          qb.andWhere('lead.processedData IN (:...lists)', { lists });
        }
  
        if (dateRange && dateRange.start && dateRange.end) {
          qb.andWhere('lead.createdAt BETWEEN :start AND :end', { start: dateRange.start, end: dateRange.end });
        }
  
        // if (phoneNumber) {
        //   qb.andWhere('lead.formData ->> :phoneField LIKE :phoneNumber', { phoneField: 'phoneNumber', phoneNumber: `%${phoneNumber}%` });
        // }
  
        if (agentIds && agentIds.length > 0) {
          qb.andWhere('agent.id IN (:...agentIds)', { agentIds });
        }
  
        if (statuses && statuses.length > 0) {
          qb.andWhere('lead.status IN (:...statuses)', { statuses });
        }
      },
    };
  
    // Call the pagination utility
      // Fetch the paginated result
  const paginatedLeads = await this.paginationUtil.paginate(this.leadRepository, paginationOptions, joinOptions);

  // Transform the result using class-transformer to exclude `@Exclude()` fields
  const transformedResult = instanceToPlain(paginatedLeads);

  return transformedResult;
  }




  async getLeadBySingleId(leadId: string): Promise<Record<string, any>> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['campaign', 'agent', 'form','processedData'], // Make sure to load necessary relations
    });


    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return instanceToPlain (lead);
  }



  async getTotalLeadsSubmitted(
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const query = this.leadRepository.createQueryBuilder('lead')
      .where('lead.deletedAt IS NULL');
  
    if (campaignId) {
      query.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }
  
    const totalLeads = await query.getCount();
    return totalLeads;
  }


  async getExpectedRevenue(
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const query = this.leadRepository.createQueryBuilder('lead')
      .where('lead.status = :status', { status: LeadStatusEnum.PENDING })
      .andWhere('lead.deletedAt IS NULL');
  
    if (campaignId) {
      query.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }
  
    const totalExpectedRevenue = await query
      .select('SUM(lead.revenue)', 'totalRevenue')
      .getRawOne();
    return totalExpectedRevenue?.totalRevenue || 0;
  }


  async getSecuredRevenue(
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const query = this.leadRepository.createQueryBuilder('lead')
      .where('lead.status = :status', { status: LeadStatusEnum.APPROVED })
      .andWhere('lead.deletedAt IS NULL');
  
    if (campaignId) {
      query.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }
  
    const totalSecuredRevenue = await query
      .select('SUM(lead.revenue)', 'totalRevenue')
      .getRawOne();
    return totalSecuredRevenue?.totalRevenue || 0;
  }


  async getInactiveLeads(
    campaignId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<number> {
    const query = this.leadRepository.createQueryBuilder('lead')
      .where('lead.status = :status', { status: LeadStatusEnum.INACTIVE })
      .andWhere('lead.deletedAt IS NULL');
  
    if (campaignId) {
      query.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    if (startDate && endDate) {
      query.andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
    }
  
    const totalInactiveLeads = await query.getCount();
    return totalInactiveLeads;
  }

  async getProcessedDataMetrics(
    processedDataId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<any> {
    // Validate processedDataId and fetch processed data
    const processedData = await this.campaignDataService.findOne({ id: processedDataId });
    if (!processedData) {
      throw new NotFoundException(`Processed data with ID ${processedDataId} not found`);
    }
  
    // Fetch leads associated with processed data within the date range
    const leads = await this.leadRepository.find({
      where: {
        processedData: { id: processedDataId },
        createdAt: Between(startDate, endDate),
      },
    });
  
    if (!leads || leads.length === 0) {
      return {
        totalRevenue: 0,
        totalLeads: 0,
        approvedLeads: 0,
        conversionRate: 0,
        revenueOverTime: [],
      };
    }
  
    // Calculate metrics
    const totalLeads = leads.length;
    const approvedLeads = leads.filter(lead => lead.status === LeadStatusEnum.APPROVED).length;
    const totalRevenue = leads
      .filter(lead => lead.status === LeadStatusEnum.APPROVED)
      .reduce((sum, lead) => sum + lead.revenue, 0);
    const conversionRate = (approvedLeads / totalLeads) * 100;
  
    // Revenue over time
    const revenueOverTime = await this.leadRepository
      .createQueryBuilder('lead')
      .select('DATE(lead.createdAt)', 'date')
      .addSelect('SUM(lead.revenue)', 'totalRevenue')
      .where('lead.processedDataId = :processedDataId', { processedDataId })
      .andWhere('lead.status = :status', { status: LeadStatusEnum.APPROVED })
      .andWhere('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .groupBy('date')
      .orderBy('date')
      .getRawMany();
  
    return {
      totalRevenue,
      totalLeads,
      approvedLeads,
      conversionRate,
      revenueOverTime,
    };
  }

  async getLeadsOverTimeRange(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
  ): Promise<any> {
    const queryBuilder = this.leadRepository.createQueryBuilder('lead')
      .where('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate });
  
    if (campaignId) {
      queryBuilder.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    // Start by selecting nothing to prevent selecting all columns by default
    queryBuilder.select([]);
  
    switch (groupBy) {
      case 'day':
        queryBuilder.addSelect('DATE(lead.createdAt)', 'date');
        queryBuilder.addGroupBy('date');
        break;
      case 'week':
        queryBuilder.addSelect('EXTRACT(WEEK FROM lead.createdAt)', 'week');
        queryBuilder.addGroupBy('week');
        break;
      case 'month':
        queryBuilder.addSelect('EXTRACT(MONTH FROM lead.createdAt)', 'month');
        queryBuilder.addGroupBy('month');
        break;
    }
  
    // Include the aggregate COUNT function for lead.id
    queryBuilder.addSelect('COUNT(lead.id)', 'totalLeads');
  
    console.log('********************************************************************');
  
    // Return the results
    return queryBuilder.getRawMany();
  }

  async getRevenueOverTimeRange(
    campaignId: string,
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month',
  ): Promise<any> {
    const queryBuilder = this.leadRepository.createQueryBuilder('lead')
      .where('lead.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .andWhere('lead.status = :approvedStatus', { approvedStatus: LeadStatusEnum.APPROVED });
  
    if (campaignId) {
      queryBuilder.andWhere('lead.campaignId = :campaignId', { campaignId });
    }
  
    // Clear default selection to prevent selecting all columns
    queryBuilder.select([]);
  
    switch (groupBy) {
      case 'day':
        queryBuilder.addSelect('DATE(lead.createdAt)', 'date');
        queryBuilder.addGroupBy('date');
        break;
      case 'week':
        queryBuilder.addSelect('EXTRACT(WEEK FROM lead.createdAt)', 'week');
        queryBuilder.addGroupBy('week');
        break;
      case 'month':
        queryBuilder.addSelect('EXTRACT(MONTH FROM lead.createdAt)', 'month');
        queryBuilder.addGroupBy('month');
        break;
    }
  
    // Include the aggregate SUM function for lead.revenue
    queryBuilder.addSelect('SUM(lead.revenue)', 'totalRevenue');
  
    return queryBuilder.getRawMany();
  }


}
