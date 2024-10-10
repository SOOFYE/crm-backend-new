import { IsOptional, IsNumber, IsString, IsEnum, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationOptions } from '../../common/interfaces/pagination-options.interface';
import { FormEntity } from '../entities/form.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FindAllFormsDto implements PaginationOptions<FormEntity> {
  @IsNumber()
  @Type(() => Number)
  page: number;

  @IsNumber()
  @Type(() => Number)
  limit: number;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Search keyword', type: String })
  searchKey?: string;

  @IsOptional()
  @IsArray()
  @ApiPropertyOptional({ description: 'Fields to search by', isArray: true, type: String })
  searchField?: (keyof FormEntity)[];

  @IsOptional()
  filters?: Record<string, any>; // Filter options

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Field to order by', enum: ['name', 'createdAt', 'updatedAt'] })
  orderBy?: keyof FormEntity;

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}