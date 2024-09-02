import { IsOptional, IsString, IsNumber, IsArray, IsEnum, ValidateNested } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { OriginalCampaignData } from '../entities/orignal-campaign-datum.entity';
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';

export class FindAllCampaignDataDto implements PaginationOptions<OriginalCampaignData> {

  @IsNumber()
  @Type(() => Number) 
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page: number = 1;

  @IsNumber()
  @Type(() => Number) 
  @ApiPropertyOptional({ description: 'Items per page', default: 10 })
  limit: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search keyword' })
  searchKey?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({
    description: 'Fields to search in',
    isArray: true,
    example: ['name', 's3Url'],
  })
  searchField?: (keyof OriginalCampaignData)[];

  @IsOptional()
  @ValidateNested()
  @Type(() => Object)
  @ApiPropertyOptional({ description: 'Filters applied to the query', type: Object })
  filters?: Partial<OriginalCampaignData>;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Field to order by', example: 'createdAt' })
  orderBy?: keyof OriginalCampaignData;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'] })
  orderDirection?: 'ASC' | 'DESC';
}
