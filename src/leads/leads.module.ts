import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadEntity } from './entities/lead.entity';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { UsersModule } from '../users/users.module';
import { CampaignDataModule } from '../campaign-data/campaign-data.module';
import { S3Module } from '../s3/s3.module';
import { FormsModule } from '../forms/forms.module';
import { UtilsModule } from '../utils/utils.module';

@Module({
  imports: [TypeOrmModule.forFeature([LeadEntity]),CampaignsModule,UsersModule,CampaignDataModule,S3Module,FormsModule,UtilsModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
