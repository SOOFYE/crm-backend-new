import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsUUID, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class FileUploadDto {
  @ApiProperty({ type: 'string', format: 'binary' })
  file: any;

  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Campaign Type ID' })
  campaignTypeId: string;

  @IsString()
  @ApiProperty({
    description: 'Comma-separated fields to check for duplicates',
    example: 'MEDICARE ID #,string',
  })
  duplicateFieldCheck: string; // This is now a string
}
