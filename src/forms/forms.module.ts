import { Module } from '@nestjs/common';
import { FormsService } from './forms.service';
import { FormsController } from './forms.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FormEntity } from './entities/form.entity';

import { CampaignEntity } from '../campaigns/entities/campaign.entity';
import { UtilsModule } from '../utils/utils.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { CampaignDataEntity } from '../campaign-data/entities/campaign-datum.entity';
import { CampaignDataModule } from '../campaign-data/campaign-data.module';

@Module({
  imports: [TypeOrmModule.forFeature([FormEntity, CampaignEntity]),UtilsModule,CampaignsModule,CampaignDataModule],
  controllers: [FormsController],
  providers: [FormsService],
  exports: [FormsService]
})
export class FormsModule {}
