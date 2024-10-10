import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignStatusEnum } from '../../common/enums/campaign-stats.enum';
import { Transform, Type } from 'class-transformer';


export class UpdateCampaignDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Name of the campaign' })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Description of the campaign' })
  description?: string;

  @IsOptional()
  @IsEnum(CampaignStatusEnum)
  @ApiPropertyOptional({ enum: CampaignStatusEnum, description: 'Status of the campaign' })
  status?: CampaignStatusEnum;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  @ApiPropertyOptional({ description: 'Array of agent UUIDs', isArray: true })
  agentIds?: string[];

  @IsOptional()
  @IsUUID()
  @ApiPropertyOptional({ description: 'Campaign type UUID' })
  campaignTypeId?: string;

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