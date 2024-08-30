import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum } from "class-validator";


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
  
  }