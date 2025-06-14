// // import { Module } from '@nestjs/common';
// // import { BullModule } from '@nestjs/bull';
// // import { JobService } from './job-service.service';

// import { BullModule } from "@nestjs/bull";
// import { Global, Module } from "@nestjs/common";
// import Redis from "ioredis";
// import { JobService } from "./job-service.service";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { CampaignDataEntity } from "../campaign-data/entities/campaign-datum.entity";
// import { OriginalCampaignData } from "../orignal-campaign-data/entities/orignal-campaign-datum.entity";
// import { CampaignTypesModule } from "../campaign-types/campaign-types.module";
// import { OriginalCampaignDataProcessor } from "./OGCamp.processor";
// import { S3Module } from "../s3/s3.module";


// // @Module({
// //   imports: [
// //     BullModule.forRoot({
// //       redis: {
// //         host: 'redis-10470.c321.us-east-1-2.ec2.cloud.redislabs.com', // Replace with your Redis configuration
// //         port: 10470,
// //         password: 'iEG87Fs71VDGMAwL080QSoLpg23SBcVj'
// //       },
// //     }),
// //     BullModule.registerQueue({
// //       name: 'default',
// //     }),
// //   ],
// //   providers: [JobService],
// //   exports: [JobService],
// // })
// // export class JobsModule {}
// @Global()
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([CampaignDataEntity,OriginalCampaignData]),
//     CampaignTypesModule,
//     S3Module,
//     BullModule.forRoot({
//       redis: {
//         host: 'redis-10470.c321.us-east-1-2.ec2.cloud.redislabs.com',
//         port: 10470,
//         password: 'iEG87Fs71VDGMAwL080QSoLpg23SBcVj',
//       },
//     }),
//     BullModule.registerQueue({
//       name: 'default',
//     }),
//   ],
//   providers: [
//     JobService,
//     OriginalCampaignDataProcessor,  // Add JobProcessor here
//     {
//       provide: 'REDIS_CLIENT',
//       useFactory: () => {
//         return new Redis({
//           host: 'redis-10470.c321.us-east-1-2.ec2.cloud.redislabs.com',
//           port: 10470,
//           password: 'iEG87Fs71VDGMAwL080QSoLpg23SBcVj',
//         });
//       },
//     },
//   ],
//   exports: ['REDIS_CLIENT', JobService],
// })
// export class JobsModule {}


import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { JobService } from './job-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CampaignDataEntity } from '../campaign-data/entities/campaign-datum.entity';
import { RedisModule } from '../redis/redis.module';
import { CampaignTypesModule } from '../campaign-types/campaign-types.module';
import { OriginalCampaignDataProcessor } from './OGCamp.processor';
import { S3Module } from '../s3/s3.module';
import Redis from 'ioredis';
import { OriginalCampaignData } from '../orignal-campaign-data/entities/orignal-campaign-datum.entity';


@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([CampaignDataEntity, OriginalCampaignData]),
    CampaignTypesModule,
    S3Module,
    BullModule.forRootAsync({
      inject: ['REDIS_CLIENT'],  // Inject the Redis client
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