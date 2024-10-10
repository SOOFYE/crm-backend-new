import { Module } from '@nestjs/common';
import { CampaignTypesService } from './campaign-types.service';
import { CampaignTypesController } from './campaign-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignTypeEntity } from './entities/campaign-type.entity';
import { UtilsModule } from '../utils/utils.module';


@Module({
  imports: [TypeOrmModule.forFeature([CampaignTypeEntity]),UtilsModule],
  controllers: [CampaignTypesController],
  providers: [CampaignTypesService],
  exports: [CampaignTypesService]
})
export class CampaignTypesModule {}
