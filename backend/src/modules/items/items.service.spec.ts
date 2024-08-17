import { InternalServerErrorException } from '@nestjs/common';

import { ItemsService } from './items.service';
import { RedisService } from '../redis/redis.service';
import { Query } from 'mongoose';

import { Item } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';

describe('ItemsService', () => {
  let service: ItemsService;
  let itemModel: any;

  let redisService: RedisService;

  beforeEach(async () => {
    itemModel = {
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findById: jest.fn(),
    };

    redisService = {
      setExpirable: jest.fn(),
      delete: jest.fn(),
    } as any;

    service = new ItemsService(itemModel, redisService);
  });

  describe('create', () => {
    it('should successfully create an item', async () => {
      const createItemDto = {
        title: 'New Item',
        description: 'Description',
        price: 10,
      };

      const createdItem = {
        ...createItemDto,
        _id: '1',
      };

      // Mock the create method to return the created item
      jest.spyOn(itemModel, 'create').mockResolvedValue(createdItem as any);

      // Call the service's create method
      const result = await service.create(createItemDto);

      // Check that the result is as expected
      expect(result).toEqual(createdItem);

      // Verify that the cache invalidation happened
      expect(redisService.delete).toHaveBeenCalledWith('items:all');
    });

    it('should handle creation errors', async () => {
      const createItemDto: CreateItemDto = {
        title: 'New Item',
        description: 'Description',
        price: 100,
      };
      jest
        .spyOn(itemModel, 'create')
        .mockRejectedValue(new Error('Creation failed'));

      await expect(service.create(createItemDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should successfully update an item', async () => {
      const updateItemDto = { title: 'Updated Item' };
      const updatedItem = { ...updateItemDto, _id: '1' };

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(updatedItem as any),
      };

      jest
        .spyOn(itemModel, 'findByIdAndUpdate')
        .mockReturnValue(mockQuery as any);

      const result = await service.update('1', updateItemDto);

      expect(result).toEqual(updatedItem);
      expect(redisService.setExpirable).toHaveBeenCalledWith(
        `item:1`,
        JSON.stringify(updatedItem),
        1,
      );
      expect(redisService.delete).toHaveBeenCalledWith('items:all');
    });

    it('should handle update errors', async () => {
      const updateItemDto = { title: 'Updated Item' };
      type MockQuery = Partial<Query<Item, Item>> & { exec: jest.Mock };

      const mockQuery: MockQuery = {
        exec: jest.fn().mockRejectedValue(new Error('Update failed')),
      };

      jest
        .spyOn(itemModel, 'findByIdAndUpdate')
        .mockReturnValue(mockQuery as Query<Item, Item>);

      // Expect the service to throw an InternalServerErrorException when the update fails
      await expect(service.update('1', updateItemDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete an item and invalidate cache', async () => {
      // Create mock implementations
      const mockDelete = jest.fn().mockResolvedValue(null); // Simulate successful deletion
      const mockDeleteAll = jest.fn().mockResolvedValue(null); // Simulate successful cache invalidation

      // Mock itemModel and redisService methods
      jest.spyOn(itemModel, 'findByIdAndDelete').mockImplementation(
        () =>
          ({
            exec: mockDelete,
          } as any),
      );

      jest.spyOn(redisService, 'delete').mockImplementation(mockDeleteAll);

      // Call the service method
      await service.remove('1');

      // Check if delete and cache invalidation were called
      expect(itemModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(redisService.delete).toHaveBeenCalledWith('item:1');
      expect(redisService.delete).toHaveBeenCalledWith('items:all');
    });

    it('should handle delete errors', async () => {
      // Mock to throw error
      jest.spyOn(itemModel, 'findByIdAndDelete').mockImplementation(
        () =>
          ({
            exec: jest.fn().mockRejectedValue(new Error('Delete failed')),
          } as any),
      );

      await expect(service.remove('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
