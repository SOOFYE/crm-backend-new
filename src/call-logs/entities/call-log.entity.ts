import { IsEnum } from "class-validator";
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne } from "typeorm";
import { CallStatusEnum } from "../../common/enums/call-status.enum";
import { CampaignEntity } from "../../campaigns/entities/campaign.entity";
import { AgentEntity } from "../../agents/entities/agent.entity";
import { RescheduleReasonEnum } from "../../common/enums/reschedule-reason.enum";
import { CallDirectionEnum } from "../../common/enums/call-direction.enum";




@Entity('call_logs')
export class CallLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Twilio-specific Call SID or similar unique identifier for the call
  @Column({ type: 'varchar', length: 255, nullable: true })
  callSid?: string;

  // Store customer data as a JSONB object
  @Column({ type: 'jsonb' })
  customerData: Record<string, any>;

  @ManyToOne(() => AgentEntity, agent => agent.callLogs)
  agent: AgentEntity;

  @ManyToOne(() => CampaignEntity, campaign => campaign.callLogs)
  campaign: CampaignEntity;

  // Call status using an enum
  @Column({ type: 'enum', enum: CallStatusEnum, default: CallStatusEnum.COMPLETED })
  @IsEnum(CallStatusEnum)
  callStatus: CallStatusEnum;

  @Column({ type: 'enum', enum: RescheduleReasonEnum, nullable: true })
  @IsEnum(RescheduleReasonEnum)
  rescheduleReason?: RescheduleReasonEnum;
  
  // Rescheduled date and time if the call is rescheduled
  @Column({ type: 'timestamp', nullable: true })
  rescheduledAt?: Date;

  // Duration of the call, if applicable (in seconds)
  @Column({ type: 'int', nullable: true })
  duration?: number;

  @Column({ type: 'enum', enum: CallDirectionEnum })
  @IsEnum(CallDirectionEnum)
  direction: CallDirectionEnum;

  @Column({ type: 'varchar', length: 255, nullable: true })
  recordingS3Url?: string;

  // Additional comments or call outcome details
  @Column({ type: 'text', nullable: true })
  comments?: string;

  // Timestamp when the log was created
  @CreateDateColumn()
  createdAt: Date;

  // Timestamp when the log was last updated
  @UpdateDateColumn()
  updatedAt: Date;

  // Soft delete column for marking a record as deleted
  @DeleteDateColumn()
  deletedAt?: Date;
}