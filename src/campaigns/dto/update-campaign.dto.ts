import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatusEnum } from '../../common/enums/campaign-stats.enum';


export class UpdateCampaignDto {
  @ApiProperty({ description: 'Name of the campaign', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the campaign', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ type: [String], description: 'List of agent UUIDs', required: false })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  agents?: string[];

  @ApiProperty({ enum: CampaignStatusEnum, description: 'Status of the campaign', required: false })
  @IsEnum(CampaignStatusEnum)
  @IsOptional()
  status?: CampaignStatusEnum;
}