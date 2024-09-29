import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CallLogEntity } from './entities/call-log.entity';
import { CallStatusEnum } from '../common/enums/call-status.enum';
import { RescheduleReasonEnum } from '../common/enums/reschedule-reason.enum';
import { CallDirectionEnum } from '../common/enums/call-direction.enum';

@Injectable()
export class CallLogsService {

  constructor(
    @InjectRepository(CallLogEntity)
    private callLogRepository: Repository<CallLogEntity>,
  ) {}



  async createCallLog(
    customerData: Record<string, any>,
    agentId: string,
    campaignId: string,
    status: CallStatusEnum,
    callSid: string,
    direction: CallDirectionEnum,
    recordingS3Url?: string,
    duration?: number,
    comments?: string,
    rescheduleReason?: RescheduleReasonEnum,
    rescheduledAt?: Date  // Optional rescheduled date
  ): Promise<CallLogEntity> {
    const callLog = this.callLogRepository.create({
      customerData,
      agent: { id: agentId },  // Assuming agentId is a valid UUID of AgentEntity
      campaign: { id: campaignId },  // Assuming campaignId is a valid UUID of CampaignEntity
      callStatus: status,
      callSid,
      direction,
      recordingS3Url,
      duration,
      comments,
      rescheduleReason,
      createdAt: new Date(),
    });

    // Reschedule for next day if status is 'RESCHEDULED' and reason is 'busy' or 'no-answer'
    if (status === CallStatusEnum.RESCHEDULED) {
      if (rescheduleReason === RescheduleReasonEnum.BUSY || rescheduleReason === RescheduleReasonEnum.NO_ANSWER || rescheduleReason === RescheduleReasonEnum.ANSWERING_MACHINE) {
        // If the reason is 'busy' or 'no-answer', schedule for the next day automatically
        callLog.rescheduledAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
      } else if (rescheduledAt) {
        // If rescheduleReason is provided and a custom reschedule date is sent, use that
        callLog.rescheduledAt = rescheduledAt;
      }
    }

    return await this.callLogRepository.save(callLog);  // Create a new entry in the database
  }
}

 
