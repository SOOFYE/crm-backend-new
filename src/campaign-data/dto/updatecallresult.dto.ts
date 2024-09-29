import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsEnum, IsDateString, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { CallStatusEnum } from "../../common/enums/call-status.enum";

export class UpdateCallResultDto {
    @ApiProperty({ type: String, description: 'ID of the agent updating the record' })
    @IsUUID()
    agentId: string;
  
    @ApiProperty({ enum: CallStatusEnum, description: 'Result of the call' })
    @IsEnum(CallStatusEnum)
    callResult: CallStatusEnum;
  
    @ApiProperty({ type: Date, description: 'Date of rescheduled call', required: false })
    @IsOptional()
    @Type(() => Date)
    @IsDateString()
    rescheduledDate?: Date;
  }