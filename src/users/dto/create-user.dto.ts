import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum, IsOptional } from "class-validator";


export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The first name of the user' })
    firstname: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The last name of the user' })
    lastname: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The username of the user' })
    username: string;
  
    @IsEmail()
    @IsNotEmpty()
    @ApiProperty({ description: 'The email of the user' })
    email: string;
  
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The phone number of the user' })
    phoneNumber: string;
  
    @IsString()
    @MinLength(8)
    @ApiProperty({ description: 'The password of the user' })
    password: string;

    @IsString()
    @IsOptional() // Since this is nullable, it's optional
    @ApiProperty({ description: 'The CNIC of the user (optional)', required: false })
    cnic?: string;  // Use optional (?) in the DTO as well

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'The bank account number of the user (optional)', required: false })
    bank_account?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'The residential address of the user (optional)', required: false })
    address?: string;

    @IsString()
    @IsOptional()
    @ApiProperty({ description: 'The emergency contact number of the user (optional)', required: false })
    emergency_no?: string;


    @IsOptional()
    @IsString()
    cnic_photo?: string;
  
  }