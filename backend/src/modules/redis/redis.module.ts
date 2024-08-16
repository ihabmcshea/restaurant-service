import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import * as redisStore from 'cache-manager-redis-store';

import { RedisService } from './redis.service';

@Module({
  imports: [
    NestCacheModule.register({
      store: redisStore as any,
      host: process.env.REDIS_HOST || 'localhost', // Redis host
      port: Number(process.env.REDIS_PORT) || 6379, // Redis port
    }),
  ],
  exports: [NestCacheModule, RedisService],
  providers: [RedisService],
})
export class RedisModule {}
