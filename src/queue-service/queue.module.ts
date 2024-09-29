import { Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { RedisModule } from '../redis.module';


@Module({
  imports: [RedisModule], // Import RedisModule to provide the REDIS_CLIENT
  providers: [QueueService],
  exports: [QueueService], // Export QueueService to be used in other modules
})
export class QueueModule {}