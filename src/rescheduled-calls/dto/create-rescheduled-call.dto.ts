import { IsString, IsNotEmpty, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';



export class CreateRescheduledCallDto {


  campaign: string;


  preprocessedData: string;

  
  recordId: string;

  
  scheduledDate: Date;
}