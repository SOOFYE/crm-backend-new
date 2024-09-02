import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsArray, IsUUID } from 'class-validator';
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { CampaignEntity } from '../entities/campaign.entity';


export class GetCampaignsByAgentDto implements PaginationOptions<CampaignEntity> {
    
  @ApiPropertyOptional({ description: 'Page number for pagination', default: 1 })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Search key for filtering results' })
  @IsOptional()
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({ description: 'Fields to search in', isArray: true, type: String })
  @IsOptional()
  @IsArray()
  searchField?: (keyof CampaignEntity)[];

  @ApiPropertyOptional({ description: 'Filters to apply on results', type: 'object' })
  @IsOptional()
  filters?: Partial<CampaignEntity>;

  @ApiPropertyOptional({ description: 'Field to order results by', type: String })
  @IsOptional()
  @IsString()
  orderBy?: keyof CampaignEntity;

  @ApiPropertyOptional({ description: 'Order direction: ASC or DESC', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}