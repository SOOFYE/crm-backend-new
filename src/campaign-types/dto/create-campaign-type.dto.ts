import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignTypeDto {
  @ApiProperty({
    description: 'The name of the campaign type',
    example: 'pt',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The name of the campaign type',
    example: 'test',
  })
  @IsNotEmpty()
  @IsString()
  description: string;
}
