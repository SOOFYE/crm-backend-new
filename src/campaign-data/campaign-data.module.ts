import { Module } from '@nestjs/common';
import { CampaignDataService } from './campaign-data.service';
import { CampaignDataController } from './campaign-data.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { S3Module } from '../s3/s3.module';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { CampaignDataEntity } from './entities/campaign-datum.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CampaignDataEntity,CampaignEntity])],
  controllers: [CampaignDataController],
  providers: [CampaignDataService],
  exports: [CampaignDataService ]
})
export class CampaignDataModule {}
