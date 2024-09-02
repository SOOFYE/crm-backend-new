import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { RescheduledCallEntity } from '../entities/rescheduled-call.entity';

export class FindAllRescheduledCallsDto implements PaginationOptions<RescheduledCallEntity> {
  
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Limit of records per page', default: 10 })
  @IsNumber()
  @Type(() => Number)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Search key for filtering' })
  @IsOptional()
  @IsString()
  searchKey?: string;

  @ApiPropertyOptional({ description: 'Fields to search in', isArray: true, type: String })
  @IsOptional()
  searchField?: (keyof RescheduledCallEntity)[];

  @ApiPropertyOptional({ description: 'Field to order by' })
  @IsOptional()
  @IsString()
  orderBy?: keyof RescheduledCallEntity;

  @ApiPropertyOptional({ description: 'Order direction (ASC or DESC)', enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';

  @ApiPropertyOptional({ description: 'Filter by campaign ID' })
  @IsOptional()
  @IsUUID()
  filters?: Partial<RescheduledCallEntity>;

  @ApiPropertyOptional({ description: 'Filter by campaign ID' })
  @IsOptional()
  @IsUUID()
  campaign?: string;

  @ApiPropertyOptional({ description: 'Filter by preprocessed data ID' })
  @IsOptional()
  @IsUUID()
  preprocessedData?: string;
}
