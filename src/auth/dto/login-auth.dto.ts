import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class AuthLoginDto{

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The username of the user' })
    username: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ description: 'The password of the user' })
    password: string;
}