import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateFormDto } from './create-form.dto';
import { IsOptional, IsString, IsArray } from 'class-validator';

export class UpdateFormDto {
    @ApiProperty({ description: 'Name of the form', required: false })
    @IsOptional()
    @IsString()
    name?: string;
  
    @ApiProperty({ description: 'Updated JSON structure for form fields', required: false })
    @IsOptional()
    @IsArray()
    fields?: any[];
  
    @ApiProperty({ description: 'Updated products and services with their respective prices', required: false })
    @IsOptional()
    @IsArray()
    productsAndPrices?: { name: string; price: number }[];  // Updated products and prices structure
  }
