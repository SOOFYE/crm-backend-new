import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray } from "class-validator";
import { CampaignStatusEnum } from "../../common/enums/campaign-stats.enum";

export class CreateCampaignDto {

    @ApiProperty({ description: 'Name of the campaign' })
    @IsString()
    @IsNotEmpty()
    name: string;
  
    @ApiProperty({ description: 'Description of the campaign', required: false })
    @IsString()
    description?: string;
  
    @ApiProperty({ description: 'UUID of the processed data' })
    @IsUUID()
    @IsNotEmpty()
    processedDataId: string;
  
    @ApiProperty({ enum: CampaignStatusEnum, description: 'Status of the campaign' })
    @IsEnum(CampaignStatusEnum)
    status: CampaignStatusEnum;
  
    @ApiProperty({ type: [String], description: 'List of agent UUIDs' })
    @IsArray()
    @IsUUID(undefined, { each: true })
    @IsNotEmpty({ each: true })
    agents: string[];
}
