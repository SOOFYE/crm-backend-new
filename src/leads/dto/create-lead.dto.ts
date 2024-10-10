import { IsUUID, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CreateLeadDto {
  @IsUUID()
  @IsNotEmpty()
  campaignId: string;

  @IsUUID()
  @IsOptional()
  processedDataId?: string;

  @IsNotEmpty()
  formData: any; // The form data submitted by the agent
}