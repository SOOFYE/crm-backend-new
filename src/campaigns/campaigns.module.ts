import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignEntity } from './entities/campaign.entity';
import { UserEntity } from '../users/entities/user.entity';
import { CampaignDataEntity } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignsService } from './campaigns.service';
import { UtilsModule } from '../utils/utils.module';
import { CampaignDataModule } from '../campaign-data/campaign-data.module';
import { CampaignTypeEntity } from '../campaign-types/entities/campaign-type.entity';
import { S3Module } from '../s3/s3.module';
import { FormEntity } from '../forms/entities/form.entity';


@Module({
  imports:[TypeOrmModule.forFeature([CampaignEntity,CampaignDataEntity,UserEntity,CampaignTypeEntity,FormEntity]),UtilsModule,CampaignDataModule,S3Module],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports : [CampaignsService]
})
export class CampaignsModule {}
