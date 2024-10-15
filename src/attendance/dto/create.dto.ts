import { IsISO8601, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateAttendanceLogDto {
    @IsNotEmpty()
    @IsString()
    agentId: string;
  
    @IsNotEmpty()
    @IsISO8601()
    date: string;
  
    @IsOptional()
    clockIn?: Date;
  
    @IsOptional()
    clockOut?: Date;
  
    @IsOptional()
    status?: string;
  }