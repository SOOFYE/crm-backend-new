import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
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

@ApiTags('Campaigns')
//@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('zipCodeFile'))
  async createCampaign(
    @Body() createCampaignDto: CreateCampaignDto,
    @UploadedFile() zipCodeFile: Express.Multer.File,
  ) {
    return this.campaignsService.createCampaign(createCampaignDto, zipCodeFile);
  }

  @Patch(':id')
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update a campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  async updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(id, updateCampaignDto);
  }

  @Get(':id')
  //@Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get a single campaign by ID' })
  @ApiParam({ name: 'id', description: 'Campaign ID', type: String })
  async getOneCampaign(@Param('id') id: string) {
    return this.campaignsService.getOneCampaign(id);
  }

  @Get()
  //@Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get all campaigns with pagination, filtering, and sorting' })
  async getAllCampaigns(@Query() query: GetAllCampaignsDto) {
    return this.campaignsService.getAllCampaigns(query);
  }


  @Get('agent/:agentId')
  @Roles(UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Get campaigns assigned to a particular agent with pagination' })
  async getCampaignsByAgent(
    @Req() req: AuthenticatedRequest,
    @Query() getCampaignsByAgentDto: GetCampaignsByAgentDto,
  ) {
    
    const agentId = req.user.id
    return this.campaignsService.getCampaignsByAgent(agentId, getCampaignsByAgentDto);
  }

  @Get(':id/campaign-data')
  async getFilteredPreprocessedData(
    @Param('id') id: string,
    @Query() paginateCampaignDataDto: PaginateCampaignDataDto,
  ) {
    return this.campaignsService.getFilteredPreprocessedData(id, paginateCampaignDataDto);
  }

  

}
