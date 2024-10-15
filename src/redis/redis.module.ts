import { Global, Module } from '@nestjs/common';
import Redis from 'ioredis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      inject: [ConfigService],  // Inject ConfigService to access environment variables
      useFactory: (configService: ConfigService) => {
        const redisHost = configService.get<string>('REDIS_HOST', 'localhost');
        const redisPort = configService.get<number>('REDIS_PORT', 6379);
        const redisPassword = configService.get<string>('REDIS_PASSWORD');

        try {
          const redis = new Redis({
            host: redisHost,
            port: redisPort,
            password: redisPassword || undefined,  // Handle optional password
          });

          console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
          return redis;
        } catch (error) {
          console.error('Failed to connect to Redis:', error);
          throw new Error('Redis connection failed');
        }
      },
    },
  ],
  exports: ['REDIS_CLIENT'],  // Export Redis client so it can be used elsewhere
})
export class RedisModule {}
