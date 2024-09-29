import { BullModule } from "@nestjs/bull";
import { Global, Module } from "@nestjs/common";
import Redis from "ioredis";
import { JobService } from "./job-service.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CampaignData } from "../campaign-data/entities/campaign-datum.entity";
import { OriginalCampaignData } from "../orignal-campaign-data/entities/orignal-campaign-datum.entity";
import { CampaignTypesModule } from "../campaign-types/campaign-types.module";
import { OriginalCampaignDataProcessor } from "./OGCamp.processor";
import { S3Module } from "../s3/s3.module";


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CampaignData, OriginalCampaignData]),
    CampaignTypesModule,
    S3Module,
    BullModule.forRootAsync({
      inject: ['REDIS_CLIENT'], // Inject the globally provided Redis client
      useFactory: (redisClient: Redis) => ({
        redis: {
          host: redisClient.options.host,
          port: redisClient.options.port,
          password: redisClient.options.password || undefined,
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'default',
    }),
  ],
  providers: [
    JobService,
    OriginalCampaignDataProcessor,
  ],
  exports: [JobService], 
})
export class JobsModule {}