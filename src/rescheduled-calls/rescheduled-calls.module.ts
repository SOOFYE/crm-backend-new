import { Module } from '@nestjs/common';
import { RescheduledCallsService } from './rescheduled-calls.service';
import { RescheduledCallsController } from './rescheduled-calls.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RescheduledCallEntity } from './entities/rescheduled-call.entity';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { CampaignData } from '../campaign-data/entities/campaign-datum.entity';
import { UtilsModule } from '../utils/utils.module';


@Module({
  imports: [TypeOrmModule.forFeature([RescheduledCallEntity,CampaignEntity, CampaignData]),UtilsModule],
  controllers: [RescheduledCallsController],
  providers: [RescheduledCallsService],
  exports: [RescheduledCallsService]
})
export class RescheduledCallsModule {}
