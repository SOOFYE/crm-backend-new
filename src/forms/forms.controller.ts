import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, Query, Req, UseGuards } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FindAllFormsDto } from './dto/find-all-forms.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LeadsService } from '../leads/leads.service';
import { CampaignsService } from '../campaigns/campaigns.service';
import { CampaignDataService } from '../campaign-data/campaign-data.service';
import { AuthRequest } from 'aws-sdk/clients/appfabric';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';

@Controller('forms')
@ApiTags('forms')
export class FormsController {
  constructor(
    private readonly formsService: FormsService,
    private readonly campaignsService: CampaignsService,
    private readonly campaignDataService:CampaignDataService

  ) {}

  @Post()
  async create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.createForm(createFormDto);
  }

 
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateFormDto: UpdateFormDto) {
    return this.formsService.updateForm(id, updateFormDto);
  }

 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.formsService.getFormById(id);
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return this.formsService.deleteForm(id);
  }

  // Fetch all forms
  @Get()
  async findAll(@Query() paginationOptions: FindAllFormsDto) {
    return this.formsService.getAllForms(paginationOptions);
  }
  
  @Post('link/:formId/campaign/:campaignId')
  async linkFormToCampaign(@Param('formId') formId: string, @Param('campaignId') campaignId: string) {
    return this.formsService.linkFormToCampaign(formId, campaignId);
  }


  @Post('unlink/campaign/:campaignId')
  async unlinkFormFromCampaign(@Param('campaignId') campaignId: string) {
    return this.formsService.unlinkFormFromCampaign(campaignId);
  }

  
  @Get('campaign/:campaignId')
  async getFormByCampaign(@Param('campaignId') campaignId: string) {
    return this.formsService.getFormByCampaign(campaignId);
  }


  @Get('fetch-form/:campaignId/:formId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getFormForAgent(
    @Req() req: AuthenticatedRequest,
    @Param('campaignId') campaignId: string,
    @Param('formId') formId: string,
    @Query('phoneNumber') phoneNumber: string
  ) {
    const agentId = req.user.id;
  
    // Step 1: Verify that the agent is part of the campaign
    await this.campaignsService.verifyAgentAccess(agentId, campaignId);
  
    // Step 2: Search for the phone number in the processed data linked to the campaign
    const { id: processedDataId, matchedRecord, campaignName } = await this.campaignDataService.searchProcessedDataByPhoneNumber(
      campaignId,
      phoneNumber
    );
  
    // Step 3: Fetch the form associated with the campaign and formId
    const form = await this.formsService.getFormForCampaign(formId, campaignId);
  
    return {
      form,
      processedDataId,
      matchedRecord, // This will help prefill the form
      campaignName
    };
  }
  



}

  

