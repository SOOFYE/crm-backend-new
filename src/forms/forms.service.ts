import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { FormEntity } from './entities/form.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { PaginationUtil } from '../utils/pagination.util';
import { FindAllFormsDto } from './dto/find-all-forms.dto';

@Injectable()
export class FormsService {

  constructor(
    @InjectRepository(FormEntity)
    private formRepository: Repository<FormEntity>,

    @InjectRepository(CampaignEntity)
    private campaignRepository: Repository<CampaignEntity>,
    private paginationUtil: PaginationUtil
  ) {}


  async createForm(createFormDto: CreateFormDto): Promise<FormEntity> {
    try {
      const { name, fields, productsAndPrices  } = createFormDto;
      
      // Validate fields structure (optional)
      this.validateFields(fields);

      // Create form entity
      const form = this.formRepository.create({ name, fields, productsAndPrices });

      return await this.formRepository.save(form);
    } catch (error) {
      throw new HttpException('Failed to create form', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findOne(criteria: FindOptionsWhere<FormEntity>): Promise<FormEntity> {
    try {
      const form = await this.formRepository.findOne({ where: criteria });
      return form;
    } catch (error) {
      
      console.log(error)
      
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Error fetching form',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Update existing form
  async updateForm(id: string, updateFormDto: UpdateFormDto): Promise<FormEntity> {
    try {
      const form = await this.formRepository.findOne({ where: { id } });
      
      if (!form) {
        throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
      }
  
      const { name, fields, productsAndPrices } = updateFormDto;
  
      // Update the name if provided
      if (name) form.name = name;
  
      // Update the fields if provided
      if (fields) form.fields = fields;
  
      // Update products and prices if provided
      if (productsAndPrices) {
        form.productsAndPrices = productsAndPrices; 
      }
  
      return await this.formRepository.save(form); // Save updated form
    } catch (error) {
      throw new HttpException('Failed to update form', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Fetch a form by ID
  async getFormById(id: string): Promise<FormEntity> {
    try {
      const form = await this.formRepository.findOne({
        where: { id },
        relations: ['campaigns'],
      });
      
      if (!form) throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
      return form;
    } catch (error) {
      throw new HttpException('Failed to retrieve form', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Delete a form by ID
  async deleteForm(id: string): Promise<void> {
    try {
      const result = await this.formRepository.softDelete(id);
      if (result.affected === 0) {
        throw new HttpException('Form not found', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      throw new HttpException('Failed to delete form', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Validate fields structure
  private validateFields(fields: any): void {
    if (!Array.isArray(fields)) {
      throw new HttpException('Fields must be an array', HttpStatus.BAD_REQUEST);
    }
    
    fields.forEach(field => {
      if (!field.label || !field.type) {
        throw new HttpException('Each field must have a label and type', HttpStatus.BAD_REQUEST);
      }
    });
  }



  async linkFormToCampaign(formId: string, campaignId: string): Promise<void> {
    const form = await this.formRepository.findOne({ where: { id: formId }, relations: ['campaigns'] });
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId }, relations: ['form'] });

    if (!form) {
      throw new NotFoundException('Form not found');
    }

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    
    if (campaign.form) {
      throw new Error('This campaign already has a form linked');
    }

    campaign.form = form;
    await this.campaignRepository.save(campaign);
  }

  
  async unlinkFormFromCampaign(campaignId: string): Promise<void> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId }, relations: ['form'] });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    campaign.form = null; // Remove the form linkage
    await this.campaignRepository.save(campaign);
  }

  
  async getFormByCampaign(campaignId: string): Promise<FormEntity> {
    const campaign = await this.campaignRepository.findOne({ where: { id: campaignId }, relations: ['form'] });
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign.form;
  }


  async getAllForms(paginationOptions: FindAllFormsDto): Promise<any> {
    try {
      return await this.paginationUtil.paginate<FormEntity>(
        this.formRepository,
        paginationOptions,
       
      );
    } catch (error) {
      throw new HttpException('Failed to fetch forms', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }



  async getFormForCampaign(formId: string, campaignId: string): Promise<FormEntity> {
    const form = await this.formRepository.findOne({
      where: { id: formId, campaigns: { id: campaignId } },
    });
  
    if (!form) {
      throw new NotFoundException('Form not found or not linked to the campaign');
    }
  
    // Remove prices from productsAndPrices field
    if (form.productsAndPrices) {
      form.productsAndPrices = form.productsAndPrices.map(product => ({
        name: product.name,  // Return only the product name
      }));
    }
  
    return form;
  }


}
