import { Controller, Post, Patch, Body, Param, UseGuards, UploadedFile, UseInterceptors, Get, Query, Delete, HttpCode, HttpStatus, UploadedFiles } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody, ApiParam } from '@nestjs/swagger';
import { OriginalCampaignDataService } from './orignal-campaign-data.service';
import { FileUploadDto } from './dto/FileUpload-OGData.dto';
import { UserRole } from '../common/enums/roles.enum';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../roles.decorator';
import { FindAllCampaignDataDto } from './dto/find-all-ogcamp.dto';



@ApiTags('Original Campaign Data')
//@ApiBearerAuth()
//@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('original-campaign-data')
export class OriginalCampaignDataController {
  constructor(private readonly originalCampaignDataService: OriginalCampaignDataService) {}

  @Post('upload')
  // @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload Original Campaign Data' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'originalData', maxCount: 1 },
    { name: 'filteringCriteria', maxCount: 1 }
  ]))
  @ApiBody({ description: 'Upload original campaign data', type: FileUploadDto })
  async uploadOriginalData(
    @UploadedFiles() files: { originalData?: Express.Multer.File[], filteringCriteria?: Express.Multer.File[] },
    @Body() body: FileUploadDto
  ) {
    const originalData = files.originalData?.[0]; // Access the original data file
    const filteringCriteria = files.filteringCriteria?.[0]; // Access the filtering criteria file
  
    return this.originalCampaignDataService.uploadOriginalData(
      originalData, 
      filteringCriteria, 
      body.campaignTypeId, 
      body.duplicateFieldCheck,
      body.filteringIncludeOrExclude  // Make sure this is passed in the body
    );
  }

  @Get()
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all campaign data with pagination, filtering, and sorting' })
  async findAll(@Query() query: FindAllCampaignDataDto) {
    return this.originalCampaignDataService.findAll(query);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete original campaign data by ID' })
  @ApiParam({ name: 'id', description: 'ID of the original campaign data to delete' })
  async deleteUploadedData(@Param('id') id: string): Promise<void> {
    await this.originalCampaignDataService.deleteUploadedData(id);
    
  }
}
