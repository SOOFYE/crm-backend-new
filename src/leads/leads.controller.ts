import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UploadedFiles, UseInterceptors, Query } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { S3Service } from '../s3/s3.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { GetPaginatedLeadsDto } from './dto/get-all-leads.dto';
import { LeadStatusEnum } from '../common/enums/lead-status.enum';
import { LeadEntity } from './entities/lead.entity';

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
  
    return this.leadsService.getPaginatedLeads(
      campaignIds,
      formId,
      lists,
      dateRange,
      phoneNumber,
      agents,
      statuses,
      { page, limit, searchKey, searchField: searchFieldCasted, orderBy: orderByCasted, orderDirection }
    );
  }


  @Get(':id')
  async getLeadBySingleId(@Param('id') id: string) {
    return await this.leadsService.getLeadBySingleId(id);
  }


}
