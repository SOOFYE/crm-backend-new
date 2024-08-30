import { PartialType } from '@nestjs/mapped-types';
import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The first name of the user' })
  firstname?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The last name of the user' })
  lastname?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The username of the user' })
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ description: 'The password of the user' })
  password?: string;
}
