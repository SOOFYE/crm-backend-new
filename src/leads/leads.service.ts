import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadEntity } from './entities/lead.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaignDataService } from '../campaign-data/campaign-data.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { UsersService } from '../users/users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { LeadStatusEnum } from '../common/enums/lead-status.enum';
import { FormsService } from '../forms/forms.service';
import { PaginationUtil } from '../utils/pagination.util';
import { PaginationOptions } from '../common/interfaces/pagination-options.interface';
import { PaginationResult } from '../common/interfaces/pagination-result.interface';
import { LeadsPaginationOptionsDto } from './dto/get-all-leads.dto';


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
    const { campaignId, formId, processedDataId, selectedProducts, phoneNumberLead, ...formFields } = createLeadDto;
  
    const campaign = await this.campaignsService.getCampaignById(campaignId);
    const agent = await this.usersService.findOne({ id: agentId });
    const processedData = await this.campaignDataService.findOne({ id: processedDataId });
    const form = await this.formService.findOne({ id: formId });
  
    // Calculate revenue based on selected products
    let revenue = 0;
    if (selectedProducts) {
      selectedProducts.forEach((productName: string) => {
        const product = form.productsAndPrices.find(p => p.name === productName);
        if (product) {
          revenue += product.price;
        }
      });
    }
  
    // Create a new lead with formData and selectedProducts stored separately
    const lead = this.leadRepository.create({
      phoneNumber:phoneNumberLead,
      campaign,
      agent,
      form,
      processedData,
      formData: formFields,
      selectedProducts,
      revenue,
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

    // Update selected products and recalculate revenue
    let revenue = 0;
    if (selectedProducts && selectedProducts.length > 0) {
      lead.selectedProducts = selectedProducts;
      selectedProducts.forEach((productName: string) => {
        const product = lead.form.productsAndPrices.find(p => p.name === productName);
        if (product) {
          revenue += product.price;
        }
      });
      lead.revenue = revenue;
    }

    // Save updated lead
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
  ): Promise<PaginationResult<LeadEntity>> {
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
  
        if (phoneNumber) {
          qb.andWhere('lead.formData ->> :phoneField LIKE :phoneNumber', { phoneField: 'phoneNumber', phoneNumber: `%${phoneNumber}%` });
        }
  
        if (agentIds && agentIds.length > 0) {
          qb.andWhere('agent.id IN (:...agentIds)', { agentIds });
        }
  
        if (statuses && statuses.length > 0) {
          qb.andWhere('lead.status IN (:...statuses)', { statuses });
        }
      },
    };
  
    // Call the pagination utility
    return this.paginationUtil.paginate(this.leadRepository, paginationOptions, joinOptions);
  }




  async getLeadBySingleId(leadId: string): Promise<LeadEntity> {
    const lead = await this.leadRepository.findOne({
      where: { id: leadId },
      relations: ['campaign', 'agent', 'form','processedData'], // Make sure to load necessary relations
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    return lead;
  }
}
