import { ApiProperty } from "@nestjs/swagger";
import { IsUUID, IsEnum, IsDateString, IsOptional } from "class-validator";
import { CallResultEnum } from "../../common/enums/call-result.enum";
import { Type } from "class-transformer";

export class UpdateCallResultDto {
    @ApiProperty({ type: String, description: 'ID of the agent updating the record' })
    @IsUUID()
    agentId: string;
  
    @ApiProperty({ enum: CallResultEnum, description: 'Result of the call' })
    @IsEnum(CallResultEnum)
    callResult: CallResultEnum;
  
    @ApiProperty({ type: Date, description: 'Date of rescheduled call', required: false })
    @IsOptional()
    @Type(() => Date)
    @IsDateString()
    rescheduledDate?: Date;
  }