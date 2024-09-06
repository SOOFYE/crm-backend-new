import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignStatusEnum } from '../../common/enums/campaign-stats.enum';
import { Transform, Type } from 'class-transformer';


class AdditionalFieldDto {
  @ApiProperty({ description: 'Name of the additional field', example: 'Relative Phone Number' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type of the additional field (e.g., text, number)', example: 'text' })
  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdateCampaignDto {
  @ApiProperty({ description: 'Name of the campaign', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Description of the campaign', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ enum: CampaignStatusEnum, description: 'Status of the campaign', required: false })
  @IsEnum(CampaignStatusEnum)
  @IsOptional()
  status?: CampaignStatusEnum;

  @ApiProperty({ type: [String], description: 'List of agent UUIDs', required: false })
  @IsArray()
  @IsUUID(undefined, { each: true })
  @IsOptional()
  agents?: string[];

  @ApiProperty({ description: 'UUID of the campaign type', required: false })
  @IsUUID()
  @IsOptional()
  campaignTypeId?: string;

  @ApiProperty({ description: 'Comma-separated string of fields for filtering', example: 'field1,field2' })
  @Transform(({ value }) => (typeof value === 'string' ? value.split(',').map((field: string) => field.trim()) : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  filterField?: string[];

  @ApiProperty({ type: [AdditionalFieldDto], description: 'List of additional fields for agents to fill', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalFieldDto)
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value); // If it's a string, parse the JSON string
      } catch (error) {
        throw new Error('Invalid additionalFields format');
      }
    }
    return value; // If it's already an array, just return it
  })
  additionalFields?: AdditionalFieldDto[];
}