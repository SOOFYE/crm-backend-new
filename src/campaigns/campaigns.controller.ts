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


  @Get(':id/filtered-data/export-csv')
  async exportFilteredDataAsCsv(@Param('id') campaignId: string, @Res() res: Response) {
    const csvData = await this.campaignsService.getFilteredDataAsCsv(campaignId);

    // Set response headers to download the CSV file
    res.header('Content-Type', 'text/csv');
    res.header('Content-Disposition', `attachment; filename="filtered-data-${campaignId}.csv"`);
    
    // Send the CSV data
    res.send(csvData);
  }


  // @Patch(':campaignId')
  // @ApiParam({ name: 'campaignId', description: 'UUID of the campaign to be updated' })
  // @UseInterceptors(FileInterceptor('fileCriteria')) // To handle CSV file upload
  // async updateCampaign(
  //   @Param('campaignId') campaignId: string,
  //   @Body() updateCampaignDto: UpdateCampaignDto,
  //   @UploadedFile() fileCriteria?: Express.Multer.File,
  // ): Promise<CampaignEntity> {
  //   try {
  //     // Call the service function to handle the update
  //     return await this.campaignsService.updateCampaign(campaignId, updateCampaignDto, fileCriteria);
  //   } catch (error) {
  //     throw new HttpException(
  //       {
  //         status: error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //         error: error.message || 'Failed to update campaign',
  //       },
  //       error.status || HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }


  @Delete(':id')
  @ApiOperation({ summary: 'Delete a campaign by ID' })
  async deleteCampaign(@Param('id') id: string): Promise<void> {
    try {
      // Call service to delete the campaign
      await this.campaignsService.deleteCampaign(id);
    } catch (error) {
      // Handle any HttpExceptions thrown from the service
      if (error instanceof HttpException) {
        throw error;
      }

      // If any other error occurs, return a generic 500 Internal Server Error
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: error.message || 'Failed to delete campaign',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

