import { Controller, Post, Patch, Body, Param, UseGuards, UploadedFile, UseInterceptors, Get, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
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
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload Original Campaign Data' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({ description: 'Upload original campaign data', type: FileUploadDto })
  async uploadOriginalData(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: FileUploadDto
  ) {
    return this.originalCampaignDataService.uploadOriginalData(file, body.campaignTypeId, body.duplicateFieldCheck);
  }


  @Get()
  //@Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all campaign data with pagination, filtering, and sorting' })
  async findAll(@Query() query: FindAllCampaignDataDto) {
    return this.originalCampaignDataService.findAll(query);
  }

}