import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignEntity } from './entities/campaign.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CampaignData } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignsService } from './campaigns.service';
import { UtilsModule } from '../utils/utils.module';
import { CampaignDataModule } from '../campaign-data/campaign-data.module';
import { CampaignType } from '../campaign-types/entities/campaign-type.entity';


@Module({
  imports:[TypeOrmModule.forFeature([CampaignEntity,CampaignData,UserEntity,CampaignType]),UtilsModule,CampaignDataModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
