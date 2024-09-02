import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class GetOneCampaignDto {
  @ApiProperty({ description: 'UUID of the campaign' })
  @IsUUID()
  id: string;
}