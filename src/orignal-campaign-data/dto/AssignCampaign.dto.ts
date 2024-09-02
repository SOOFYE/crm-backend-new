import { IsUUID } from 'class-validator';

export class AssignCampaignDto {
  @IsUUID()
  originalDataId: string;

  @IsUUID()
  campaignId: string;
}