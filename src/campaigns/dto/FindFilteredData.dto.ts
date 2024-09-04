import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, IsInt, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginateFilteredDataDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Type(() => Number)
  page: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Type(() => Number)
  limit: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  searchKey?: string;

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  searchField?: string[];

  @ApiProperty({ type: [String], required: false })
  @IsOptional()
  @IsArray()
  filters?: Record<string, any>;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiProperty({ required: false, enum: ['ASC', 'DESC'], default: 'ASC' })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  orderDirection?: 'ASC' | 'DESC';
}
