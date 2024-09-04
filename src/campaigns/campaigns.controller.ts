import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { UserRole } from '../common/enums/roles.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../roles.decorator';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { GetAllCampaignsDto } from './dto/GetAllCampaigns.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { GetCampaignsByAgentDto } from './dto/GetCampaignsByAgent.dto';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { PaginateCampaignDataDto } from '../campaign-data/dto/PaginateCampaignData.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginateFilteredDataDto } from './dto/FindFilteredData.dto';

@ApiTags('Campaigns')
//@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('fileCriteria'))
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @UploadedFile() filterCriteria: Express.Multer.File,
  ) {
    return await this.campaignsService.createCampaign(createCampaignDto, filterCriteria);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns with pagination' })

  async getAllCampaigns(@Query() query: GetAllCampaignsDto) {
      return await this.campaignsService.getAllCampaigns(query);
  }


  @Get('campaign-ids')
  async getAllCampaignIdsAndNames(){
    return await this.campaignsService.getAllCampaignIdsAndNames()
  }

  @Get(':id')
  async getSingleCampaignData(
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.getSingleCampaign(campaignId);
  }



  @Get(':id/filtered-data')
  async getFilteredData(
    @Param('id') campaignId: string,
    @Query() query: PaginateFilteredDataDto,
  ) {
    return this.campaignsService.getFilteredData(campaignId, query);
  }



}
