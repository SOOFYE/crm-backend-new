import { IsUUID } from 'class-validator';

export class UpdateOriginalCampaignDataDto {
  @IsUUID()
  campaignTypeId: string;
}
