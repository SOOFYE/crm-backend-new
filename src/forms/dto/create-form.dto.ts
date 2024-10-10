import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsUUID } from 'class-validator';

export class CreateFormDto {
  @ApiProperty({ description: 'Name of the form' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'JSON structure for form fields and configurations' })
  @IsArray()
  fields: any[];

  @ApiProperty({ description: 'Products and services with their respective prices', type: 'array', items: { type: 'object' } })
  @IsArray()
  productsAndPrices: { name: string; price: number }[];  // Define structure for products and prices
}

