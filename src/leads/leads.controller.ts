import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UploadedFiles, UseInterceptors, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { S3Service } from '../s3/s3.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GetPaginatedLeadsDto } from './dto/get-all-leads.dto';
import { LeadStatusEnum } from '../common/enums/lead-status.enum';
import { LeadEntity } from './entities/lead.entity';
import { query } from 'express';

@Controller('leads')
@ApiTags('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly s3Service: S3Service,

  ) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async submitLead(
    @Req() req: AuthenticatedRequest,
    @Body() formData: any, // General form data
    @UploadedFiles() files: Array<Express.Multer.File> // Array of uploaded files
  ) {

    console.log({...formData})

    // Upload each file to S3
    const fileUploads = await Promise.all(
      files.map(file => this.s3Service.uploadFile('form-data', file))
    );

    // Map the uploaded file URLs to their respective fields
    const fileUrls = {};
    files.forEach((file, index) => {
      const fieldName = file.fieldname; // This matches the field name in the form
      fileUrls[fieldName] = fileUploads[index].s3Url;
    });

    // Combine form data with the uploaded file URLs
    const leadData = {
      ...formData,
      ...fileUrls,
    };

    // Pass data to the service to save the lead
    return this.leadsService.createLead(req.user.id,leadData);
  }


@Patch(':leadId')
// @ApiBearerAuth()
// @UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(AnyFilesInterceptor())
async updateLead(
  @Req() req: AuthenticatedRequest,
  @Param('leadId') leadId: string,
  @Body() formData: any,
  @UploadedFiles() files: Array<Express.Multer.File>
) {

  // Upload new files to S3
  const fileUploads = await Promise.all(
    files.map(file => this.s3Service.uploadFile('form-data', file))
  );

  // Map uploaded files to their respective fields
  const fileUrls = {};
  files.forEach((file, index) => {
    const fieldName = file.fieldname; // This matches the field name in the form
    fileUrls[fieldName] = fileUploads[index].s3Url;
  });

  // Combine form data with uploaded files
  const leadData = {
    ...formData,
    ...fileUrls,
  };

  // Call the service to update the lead
  return this.leadsService.updateLead(leadId, leadData);
}


 formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-numeric characters from the phone number
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Check if the number has exactly 10 digits (valid US number)
  if (cleaned.length !== 10) {
    throw new Error('Invalid phone number, must contain exactly 10 digits');
  }

  // Format the phone number into (xxx) yyy-zzzz
  const formattedPhoneNumber = `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;

  return formattedPhoneNumber;
}

@Patch(':id/status')
async updateLeadStatus(
  @Param('id') leadId: string,
  @Body('status') newStatus: {status:LeadStatusEnum}
) {

  
  // Validate if the new status is part of LeadStatusEnum
  if (!Object.values(LeadStatusEnum).includes(newStatus.status)) {
    throw new NotFoundException(`Invalid status: ${newStatus.status}`);
  }

  // Call the service to update the lead status
  const updatedLead = await this.leadsService.updateLeadStatus(leadId, newStatus.status);

  return {
    message: 'Lead status updated successfully',
    updatedLead,
  };
}

  @Get()
  async getPaginatedLeads(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('searchKey') searchKey: string,
    @Query('searchField') searchField: string[],   // Change to string[] in controller
    @Query('orderBy') orderBy: string,            // Keep as string
    @Query('orderDirection') orderDirection: 'ASC' | 'DESC',
    @Query('agents') agents?: string[], 
    @Query('statuses') statuses?: LeadStatusEnum[],
    @Query('campaignIds') campaignIds?: string[],
    @Query('lists') lists?: string[],
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('formId') formId?: string,
    @Query('phoneNumber') phoneNumber?: string
  ) {
    const dateRange = startDate && endDate ? { start: new Date(startDate), end: new Date(endDate) } : null;
  
    // Cast searchField to correct type
    const searchFieldCasted = searchField as (keyof LeadEntity)[];
  
    // Ensure orderBy is a valid field in LeadEntity
    const orderByCasted = orderBy as keyof LeadEntity;



    if(searchKey)
      searchKey = this.formatPhoneNumber(searchKey)
 

  
    return this.leadsService.getPaginatedLeads(
      campaignIds,
      formId,
      lists,
      dateRange,
      searchKey,
      agents,
      statuses,
      { page, limit, searchKey, searchField: searchFieldCasted, orderBy: orderByCasted, orderDirection }
    );
  }

  @Get('/total-leads')
  async getTotalLeads(
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ): Promise<number> {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
  
    return this.leadsService.getTotalLeadsSubmitted(campaignId, startDate, endDate);
  }

  @Get('/expected-revenue')
  async getExpectedRevenue(
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ): Promise<number> {

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    return this.leadsService.getExpectedRevenue(campaignId, startDate, endDate);
  }

  @Get('/secured-revenue')
  async getSecuredRevenue(
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ): Promise<number> {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    return this.leadsService.getSecuredRevenue(campaignId, startDate, endDate);
  }

  @Get('/inactive-leads')
  async getInactiveLeads(
    @Query('campaignId') campaignId?: string,
    @Query('startDate') startDateStr?: string,
    @Query('endDate') endDateStr?: string
  ): Promise<number> {
    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;
    return this.leadsService.getInactiveLeads(campaignId, startDate, endDate);
  }

  @Get('/processed-data-metrics/:processedDataId')
  @ApiOperation({ summary: 'Get metrics for a specific processed data entry' })
  @ApiParam({ name: 'processedDataId', required: true, description: 'ID of the processed data entry' })
  @ApiQuery({ name: 'startDate', required: true, description: 'Start date for the metrics', type: String })
  @ApiQuery({ name: 'endDate', required: true, description: 'End date for the metrics', type: String })
  async getProcessedDataMetrics(
    @Param('processedDataId') processedDataId: string,
    @Query('startDate') startDateStr: string,
    @Query('endDate') endDateStr: string,
  ): Promise<any> {
    // Parse dates from query parameters
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
  
    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid startDate or endDate');
    }
    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }
  
    // Call the service method with the parsed dates
    return this.leadsService.getProcessedDataMetrics(processedDataId, startDate, endDate);
  }


  @Get('/leads-over-time')
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'groupBy', required: true, enum: ['day', 'week', 'month'] })
  async getLeadsOverTime(
    @Query('campaignId') campaignId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month',
  ) {
    console.log('********************************************************************')
    const leads = await this.leadsService.getLeadsOverTimeRange(campaignId, new Date(startDate), new Date(endDate), groupBy);
    return leads;
  }

  @Get('/revenue-over-time')
  @ApiQuery({ name: 'campaignId', required: false })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'groupBy', required: true, enum: ['day', 'week', 'month'] })
  async getRevenueOverTime(
    @Query('campaignId') campaignId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('groupBy') groupBy: 'day' | 'week' | 'month',
  ) {
    const revenue = await this.leadsService.getRevenueOverTimeRange(campaignId, new Date(startDate), new Date(endDate), groupBy);
    return revenue;
  }


  @Get(':id')
  async getLeadBySingleId(@Param('id') id: string) {
    return await this.leadsService.getLeadBySingleId(id);
  }


  

}
