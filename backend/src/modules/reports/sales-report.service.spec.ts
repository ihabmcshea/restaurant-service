import { Test, TestingModule } from '@nestjs/testing';
import { SalesReportService } from './sales-report.service';
import { InternalServerErrorException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { RedisService } from '../redis/redis.service';

describe('SalesReportService', () => {
  let service: SalesReportService;
  let orderModel: jest.Mocked<any>;
  let redisService: jest.Mocked<RedisService>;

  beforeEach(async () => {
    orderModel = {
      aggregate: jest.fn(),
    };

    redisService = {
      get: jest.fn(),
      setExpirable: jest.fn(),
    } as any;

    service = new SalesReportService(orderModel, redisService);
  });

  describe('generateDailySalesReport', () => {
    it('should generate a daily sales report successfully', async () => {
      const expectedResult = [
        {
          totalRevenue: 1000,
          totalOrders: 10,
          itemsSold: [
            {
              itemId: '1',
              title: 'Item 1',
              quantitySold: 20,
            },
            {
              itemId: '2',
              title: 'Item 2',
              quantitySold: 15,
            },
          ],
        },
      ];

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const expectedCacheKey = `daily_sales_report_${startOfDay.toISOString()}_${endOfDay.toISOString()}`;

      const mockRedisGet = jest.fn().mockResolvedValue(null);
      const mockRedisSetExpirable = jest.fn();

      jest.spyOn(redisService, 'get').mockImplementation(mockRedisGet);
      jest
        .spyOn(redisService, 'setExpirable')
        .mockImplementation(mockRedisSetExpirable);

      const mockQuery = {
        exec: jest.fn().mockResolvedValue(expectedResult as any),
      };
      jest.spyOn(orderModel, 'aggregate').mockReturnValue(mockQuery as any);

      const result = await service.generateDailySalesReport();
      expect(result).toEqual(expectedResult[0]);

      // Ensure Redis cache methods are called correctly
      expect(redisService.setExpirable).toHaveBeenCalledWith(
        expectedCacheKey,
        JSON.stringify(expectedResult[0]),
        1,
      );
    });
  });
});
