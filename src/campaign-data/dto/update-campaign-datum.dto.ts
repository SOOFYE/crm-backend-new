import { PartialType } from '@nestjs/swagger';
import { CreateCampaignDatumDto } from './create-campaign-datum.dto';

export class UpdateCampaignDatumDto extends PartialType(CreateCampaignDatumDto) {}
