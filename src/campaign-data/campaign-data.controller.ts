import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CampaignDataService } from './campaign-data.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { PaginateCampaignDataDto } from './dto/PaginateCampaignData.dto';
import { CallResultEnum } from '../common/enums/call-result.enum';
import { UpdateCallResultDto } from './dto/updatecallresult.dto';
import { CampaignData } from './entities/campaign-datum.entity';

@ApiTags('Campaign Data')
@Controller('campaign-data')
export class CampaignDataController {
  constructor(private readonly campaignDataService: CampaignDataService) {}

  @Get(':id/data')
  @ApiOperation({ summary: 'Paginate, search, and sort the data field of a campaign data entity' })
  @ApiParam({ name: 'id', description: 'ID of the specific record to update', type: String })
  async paginateCampaignData(
    @Param('id') id: string,
    @Query() query: PaginateCampaignDataDto,
  ) {
    return this.campaignDataService.paginateCampaignData(id, query);
  }

  // @Patch(':campaignDataId/record/:recordId')
  // @ApiOperation({ summary: 'Update the call result for a specific record in the campaign data' })
  // @ApiParam({ name: 'campaignDataId', description: 'ID of the campaign data', type: String })
  // @ApiParam({ name: 'recordId', description: 'ID of the specific record to update', type: String })
  // @ApiBody({ type: UpdateCallResultDto })
  // async updateCallResult(
  //   @Param('campaignDataId') campaignDataId: string,
  //   @Param('recordId') recordId: string,
  //   @Body() updateCallResultDto: UpdateCallResultDto,
  // ) {
  //   return this.campaignDataService.updateCallResult(
  //     campaignDataId,
  //     recordId,
  //     updateCallResultDto.agentId,
  //     updateCallResultDto.callResult,
  //     updateCallResultDto.rescheduledDate // Include rescheduledDate in the service call
  //   );
  // }

  @Post(':campaignDataId/link-campaign/:campaignId')
  async linkCampaign(
    @Param('campaignDataId') campaignDataId: string,
    @Param('campaignId') campaignId: string,
  ): Promise<Boolean> {
    return this.campaignDataService.linkCampaignData(campaignDataId, campaignId);
  }


  @Post(':campaignDataId/unlink-campaign')
  async unLinkCampaign(
    @Param('campaignDataId') campaignDataId: string,
  ): Promise<Boolean> {
    return this.campaignDataService.unLinkCampaign(campaignDataId);
  }

}