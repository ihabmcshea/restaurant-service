import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Injectable,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import logger from '../../common/logging/winston-logger';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;
  private readonly subscriber: Redis;

  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });

    this.subscriber = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    });
  }

  async setExpirable(key: string, value: string, expiryInHours: number) {
    try {
      await this.redisClient.set(key, value, 'EX', expiryInHours * 60 * 60);
    } catch (error) {
      logger.error(`Failed to set expirable key ${key}:`, error);
      throw new InternalServerErrorException('Failed to set expirable key');
    }
  }

  async set(key: string, value: string) {
    try {
      await this.redisClient.set(key, value);
    } catch (error) {
      logger.error(`Failed to set key ${key}:`, error);
      throw new InternalServerErrorException('Failed to set key');
    }
  }

  async get(key: string) {
    try {
      return await this.redisClient.get(key);
    } catch (error) {
      logger.error(`Failed to get key ${key}:`, error);
      throw new InternalServerErrorException('Failed to get key');
    }
  }

  async delete(key: string) {
    try {
      await this.redisClient.del(key);
    } catch (error) {
      logger.error(`Failed to delete key ${key}:`, error);
      throw new InternalServerErrorException('Failed to delete key');
    }
  }

  async subscribe(channel: string, callback: (message: string) => void) {
    try {
      await this.subscriber.subscribe(channel);
      this.subscriber.on('message', (channel, message) => {
        callback(message);
      });
    } catch (error) {
      logger.error(`Failed to subscribe to channel ${channel}:`, error);
      throw new InternalServerErrorException('Failed to subscribe to channel');
    }
  }

  async unsubscribe(channel: string) {
    try {
      await this.subscriber.unsubscribe(channel);
    } catch (error) {
      logger.error(`Failed to unsubscribe from channel ${channel}:`, error);
      throw new InternalServerErrorException(
        'Failed to unsubscribe from channel',
      );
    }
  }
}
