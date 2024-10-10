import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { CampaignStatusEnum } from '../../common/enums/campaign-stats.enum';
import { Transform, Type } from 'class-transformer';

export class CreateCampaignDto {
  @IsString()
  @ApiProperty({ description: 'Name of the campaign' })
  name: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description of the campaign' })
  description?: string;

  @IsEnum(CampaignStatusEnum)
  @ApiProperty({ enum: CampaignStatusEnum, description: 'Status of the campaign' })
  status: CampaignStatusEnum;

  @IsArray()
  @IsUUID('4', { each: true })
  @ApiProperty({ description: 'Array of agent UUIDs', isArray: true })
  agentIds: string[];

  @IsUUID()
  @ApiProperty({ description: 'Campaign type UUID' })
  campaignTypeId: string;

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Form UUID (optional)' })
  formId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ description: 'Array of campaign data UUIDs (optional)', isArray: true })
  processedDataIds?: string[];
}