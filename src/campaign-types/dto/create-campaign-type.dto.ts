import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsArray, ArrayNotEmpty, IsOptional } from "class-validator";

export class CreateCampaignTypeDto {
  @ApiProperty({
    description: 'The name of the campaign type',
    example: 'pt',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'A description of the campaign type',
    example: 'test',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Required fields for the campaign type',
    example: ['field1', 'field2'],
    type: [String], 
    required: false, 
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsOptional()
  @IsString({ each: true }) 
  requiredFields?: string[]; 
}