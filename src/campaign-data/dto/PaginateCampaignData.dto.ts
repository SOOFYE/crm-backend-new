import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsEnum, ValidateNested } from "class-validator";

export class FilterOptionsDto {
    @ApiPropertyOptional({ description: 'Filter by agent ID', example: 'f3b8a2d7-2c7f-4e6c-8b7f-8b2f8f8f8f8f' })
    @IsOptional()
    @IsString()
    agent?: string;
  
    @ApiPropertyOptional({ description: 'Filter by call result', example: 'Sales meet' })
    @IsOptional()
    @IsString()
    call_result?: string;
  
    @ApiPropertyOptional({ description: 'Filter by last updated date', example: '2024-08-31T10:20:30Z' })
    @IsOptional()
    @IsString()
    updated_at?: string;
  }

export class PaginateCampaignDataDto {
    @ApiProperty({ description: 'Page number for pagination', example: 1 })
    @IsNumber()
    @Type(() => Number)
    page: number = 1;
  
    @ApiProperty({ description: 'Limit of records per page', example: 10 })
    @IsNumber()
    @Type(() => Number)
    limit: number = 10;
  
    @ApiPropertyOptional({ description: 'Search keyword to filter data', example: 'John Doe' })
    @IsOptional()
    @IsString()
    searchKey?: string;
  
    @ApiPropertyOptional({ description: 'Field to order by', example: 'createdAt' })
    @IsOptional()
    @IsString()
    orderBy?: string;
  
    @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'], example: 'ASC' })
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    orderDirection?: 'ASC' | 'DESC';
  
    @ApiPropertyOptional({ description: 'Filters to apply', type: () => FilterOptionsDto })
    @IsOptional()
    @ValidateNested()
    @Type(() => FilterOptionsDto)
    filters?: FilterOptionsDto;
  }
  
