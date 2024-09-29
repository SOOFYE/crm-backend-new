import { PartialType } from '@nestjs/mapped-types';
import { IsString, MinLength, IsOptional, IsEmail } from 'class-validator';
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
  @IsEmail()
  @ApiPropertyOptional({ description: 'The email of the user' })
  email?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The phone number of the user' })
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @ApiPropertyOptional({ description: 'The password of the user' })
  password?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The CNIC of the user' })
  cnic?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The bank name of the user' })
  bankName?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The bank account of the user' })
  bankAccount?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The address of the user' })
  address?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'The emergency phone number of the user' })
  emergencyPhoneNumber?: string;
}