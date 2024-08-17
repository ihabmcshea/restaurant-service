import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { RedisService } from '../redis/redis.service';
import logger from '../../common/logging/winston-logger';

@Injectable()
export class ItemsService {
  constructor(
    @InjectModel('Item') private readonly itemModel: Model<Item>,
    private readonly redisService: RedisService,
  ) {}

  async findAll(): Promise<Item[]> {
    const cacheKey = 'items:all';
    try {
      const cachedItems = await this.redisService.get(cacheKey);

      if (cachedItems) {
        return JSON.parse(cachedItems);
      }

      const items = await this.itemModel.find().exec();
      await this.redisService.setExpirable(cacheKey, JSON.stringify(items), 1); // cache for 1 hour
      return items;
    } catch (error) {
      logger.error('Failed to find all items:', error);
      throw new InternalServerErrorException('Failed to retrieve items');
    }
  }

  async findOne(id: string): Promise<Item | null> {
    const cacheKey = `item:${id}`;
    try {
      const cachedItem = await this.redisService.get(cacheKey);

      if (cachedItem) {
        return JSON.parse(cachedItem);
      }

      const item = await this.itemModel.findById(id).exec();
      if (item) {
        await this.redisService.setExpirable(cacheKey, JSON.stringify(item), 1);
      }
      return item;
    } catch (error) {
      logger.error(`Failed to find item with id ${id}:`, error);
      throw new InternalServerErrorException('Failed to retrieve item');
    }
  }

  async create(createItemDto: CreateItemDto): Promise<Item> {
    try {
      const item = await this.itemModel.create(createItemDto);
      await this.redisService.delete('items:all'); // Invalidate cache
      return item;
    } catch (error) {
      logger.error('Failed to create item:', error);
      throw new InternalServerErrorException('Failed to create item');
    }
  }

  async update(id: string, updateItemDto: UpdateItemDto): Promise<Item | null> {
    try {
      console.log('Updating item with id:', id);
      const item = await this.itemModel
        .findByIdAndUpdate(id, updateItemDto, { new: true })
        .exec();
      if (item) {
        console.log('Item updated, updating cache');
        await this.redisService.setExpirable(
          `item:${id}`,
          JSON.stringify(item),
          1,
        );
        console.log('Cache updated, invalidating cache for items:all');
        await this.redisService.delete('items:all'); // Invalidate cache
      }
      return item;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new InternalServerErrorException('Failed to update item');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      console.log('Attempting to delete item with id:', id); // Log the ID being used
      const result = await this.itemModel.findByIdAndDelete(id).exec();
      console.log('Delete result:', result); // Log the result of deletion

      await this.redisService.delete(`item:${id}`);
      await this.redisService.delete('items:all'); // Invalidate cache

      console.log('Successfully deleted item and invalidated cache');
    } catch (error) {
      console.error(`Failed to delete item with id ${id}:`, error); // Log the error details
      throw new InternalServerErrorException('Failed to delete item');
    }
  }
}
