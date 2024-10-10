import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsString, IsArray, ValidateNested, IsEnum, IsUUID, IsObject } from "class-validator";
import { LeadStatusEnum } from "../../common/enums/lead-status.enum";
import { LeadEntity } from "../entities/lead.entity";

export class LeadsPaginationOptionsDto {
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
    searchField?: (keyof LeadEntity)[];
  
    @IsOptional()
    @ValidateNested()
    @Type(() => Object)
    @ApiPropertyOptional({ description: 'Filters applied to the query', type: Object })
    filters?: Partial<LeadEntity>;
  
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: 'Field to order by', example: 'createdAt' })
    orderBy?: keyof LeadEntity;
  
    @IsOptional()
    @IsEnum(['ASC', 'DESC'])
    @ApiPropertyOptional({ description: 'Order direction', enum: ['ASC', 'DESC'] })
    orderDirection?: 'ASC' | 'DESC';
  }
  
  // DateRange DTO
  class DateRangeDto {
    @IsString()
    @IsOptional()
    start: string;
  
    @IsString()
    @IsOptional()
    end: string;
  }
  
  // Lead Filtering DTO
  export class GetPaginatedLeadsDto {
    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    campaignIds?: string[];
  
    @IsUUID('4')
    @IsOptional()
    formId?: string;
  
    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    lists?: string[];
  
    @IsObject()
    @IsOptional()
    @Type(() => DateRangeDto)
    dateRange?: DateRangeDto;
  
    @IsString()
    @IsOptional()
    phoneNumber?: string;
  
    @IsArray()
    @IsOptional()
    @IsUUID('4', { each: true })
    agentIds?: string[];
  
    @IsArray()
    @IsOptional()
    @IsEnum(LeadStatusEnum, { each: true })
    statuses?: LeadStatusEnum[];
  
    @Type(() => LeadsPaginationOptionsDto)
    @IsOptional()
    paginatedOptions?: LeadsPaginationOptionsDto;
  }
  