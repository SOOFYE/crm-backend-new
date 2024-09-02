import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsArray, IsEnum } from "class-validator";
import { PaginationOptions } from "../../common/interfaces/pagination-options.interface";
import { CampaignEntity } from "../entities/campaign.entity";

export class GetAllCampaignsDto implements PaginationOptions<CampaignEntity> {
  
    @ApiPropertyOptional({ description: 'Page number', default: 1 })
    @IsNumber()
    @IsOptional()
    page: number = 1;
  
    @ApiPropertyOptional({ description: 'Number of items per page', default: 10 })
    @IsNumber()
    @IsOptional()
    limit: number = 10;
  
    @ApiPropertyOptional({ description: 'Search key for filtering campaigns' })
    @IsString()
    @IsOptional()
    searchKey?: string;
  
    @ApiPropertyOptional({ description: 'Fields to search by', example: ['name'] })
    @IsArray()
    @IsOptional()
    searchField?: (keyof CampaignEntity)[];
  
    @ApiPropertyOptional({ description: 'Filter campaigns by specific fields' })
    @IsOptional()
    filters?: Partial<CampaignEntity>;
  
    @ApiPropertyOptional({ description: 'Field to order by', example: 'name' })
    @IsOptional()
    orderBy?: keyof CampaignEntity;
  
    @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'], default: 'ASC' })
    @IsEnum(['ASC', 'DESC'])
    @IsOptional()
    orderDirection?: 'ASC' | 'DESC';
  }