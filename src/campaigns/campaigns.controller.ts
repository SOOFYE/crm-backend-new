import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors, HttpException, HttpStatus, Res } from '@nestjs/common';
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
import { Response } from 'express';
import { CampaignEntity } from './entities/campaign.entity';

@ApiTags('Campaigns')

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
  ) {
    return await this.campaignsService.createCampaign(createCampaignDto);
  }

  @Get('active')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getActiveCampaignsForAgent(@Req() req: AuthenticatedRequest) {
    console.log(req.user.id)
    const agentId = req.user.id; // Assuming the user ID is available in the request object
    return this.campaignsService.getActiveCampaignsForAgent(agentId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all campaigns with pagination' })
  async getAllCampaigns(@Query() query: GetAllCampaignsDto) {
      return await this.campaignsService.getAllCampaigns(query);
  }

  @Get('names-ids')
  @ApiOperation({ summary: 'Get all campaigns ' })
  async getAllCampaignsNamesAndIds() {
      return await this.campaignsService.getAllCampaignIdsAndNames();
  }

    @Get(':id')
  async getSingleCampaignData(
    @Param('id') campaignId: string,
  ) {
    return this.campaignsService.getCampaignById(campaignId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a campaign by ID' })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

}

