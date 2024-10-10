import { IsOptional, IsNumber, IsString, IsEnum, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CampaignTypeEntity } from '../entities/campaign-type.entity';
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { Type } from 'class-transformer';

export class FindAllCampaignTypesDto implements PaginationOptions<CampaignTypeEntity> {
  
  @IsNumber()
  @Type(()=>Number)
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  page: number = 1;


  @IsNumber()
  @Type(()=>Number)
  @ApiPropertyOptional({ description: 'Limit of campaign types per page', default: 10 })
  limit: number = 10;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search keyword', type: String })
  searchKey?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Fields to search by', isArray: true, type: String })
  searchField?: (keyof CampaignTypeEntity)[];

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Field to order by', enum: ['name', 'createdAt', 'updatedAt'] })
  orderBy?: keyof CampaignTypeEntity;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'] })
  orderDirection?: 'ASC' | 'DESC';

  @IsOptional()
  @ApiPropertyOptional({ description: 'Filters applied to the query', type: Object })
  filters?: Partial<CampaignTypeEntity>;
}
