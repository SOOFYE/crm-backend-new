import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OriginalCampaignData } from './entities/orignal-campaign-datum.entity';
import { OriginalCampaignDataService } from './orignal-campaign-data.service';
import { OriginalCampaignDataController } from './orignal-campaign-data.controller';
import { CampaignDataEntity } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignTypesModule } from '../campaign-types/campaign-types.module';
import { S3Module } from '../s3/s3.module';
import { UtilsModule } from '../utils/utils.module';
import { CampaignEntity } from '../campaigns/entities/campaign.entity';



@Module({
  imports:  [TypeOrmModule.forFeature([OriginalCampaignData,CampaignDataEntity,CampaignEntity]),S3Module,CampaignTypesModule,UtilsModule],
  controllers: [OriginalCampaignDataController],
  providers: [OriginalCampaignDataService],
})
export class OrignalCampaignDataModule {}
