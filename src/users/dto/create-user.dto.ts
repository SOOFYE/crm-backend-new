import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsEmail, MinLength, IsEnum, IsOptional } from "class-validator";
import { UserRole } from "../../common/enums/roles.enum";


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
  @IsNotEmpty()
  @ApiProperty({ description: 'The CNIC number of the user' })
  cnic: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The bank name of the user', required: false })
  bankName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The bank account number of the user', required: false })
  bankAccount?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The address of the user', required: false })
  address?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'The emergency phone number of the user', required: false })
  emergencyPhoneNumber?: string;

  @IsEnum(UserRole)
  @ApiProperty({ enum: UserRole, description: 'The role of the user', required: false })
  role: UserRole;
}