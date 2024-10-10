import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger';
import { IsUUID, IsArray, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { FilteringModeEnum } from '../../common/enums/filtering-mode.enum';

export class FileUploadDto {
  @IsUUID()
  @IsNotEmpty()
  @ApiProperty({ description: 'Campaign Type ID' })
  campaignTypeId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Comma-separated fields to check for duplicates',
    example: 'MEDICARE ID #,string',
  })
  duplicateFieldCheck: string; // String for duplicate field checks

  @IsEnum(FilteringModeEnum)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Filtering mode: include or exclude records matching criteria',
    enum: FilteringModeEnum,
    example: FilteringModeEnum.INCLUDE,
  })
  filteringIncludeOrExclude: FilteringModeEnum; // Enum for include/exclude
}
