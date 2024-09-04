import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { CampaignStatusEnum } from '../../common/enums/campaign-stats.enum';
import { Transform, Type } from 'class-transformer';

export class FilterCriteriaDto {
  @ApiProperty({ description: 'Key for filtering', example: 'zipcodes' })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({ type: [String], description: 'Values for filtering', example: ['12345', '67890'] })
  @IsArray()
  @IsString({ each: true })
  values: string[];
}

export class CreateCampaignDto {
  
    @ApiProperty({ description: 'Name of the campaign' })
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @ApiProperty({ description: 'Description of the campaign', required: false })
    @IsString()
    description?: string;
  
    @ApiProperty({ enum: CampaignStatusEnum, description: 'Status of the campaign' })
    @IsEnum(CampaignStatusEnum)
    status: CampaignStatusEnum = CampaignStatusEnum.ACTIVE;
  
    @ApiProperty({ type: [String], description: 'List of agent UUIDs' })
    @IsArray()
    @IsUUID(undefined, { each: true })
    agents: string[];
  
    @ApiProperty({ description: 'UUID of the campaign type' })
    @IsUUID()
    @IsNotEmpty()
    campaignTypeId: string;
  
    @ApiProperty({ type: [String], description: 'Fields to be used for filtering the preprocessed data' })
    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            try {
                return JSON.parse(value);
            } catch (error) {
                throw new Error('Invalid JSON string');
            }
        }
        return value;
    })
    filterField: string[];
  }