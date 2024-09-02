import { Module } from '@nestjs/common';
import { CampaignDataService } from './campaign-data.service';
import { CampaignDataController } from './campaign-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignData } from './entities/campaign-datum.entity';
import { S3Module } from '../s3/s3.module';
import { RescheduledCallsModule } from '../rescheduled-calls/rescheduled-calls.module';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignData]),RescheduledCallsModule],
  controllers: [CampaignDataController],
  providers: [CampaignDataService],
  exports: [CampaignDataService ]
})
export class CampaignDataModule {}
