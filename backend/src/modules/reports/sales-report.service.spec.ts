import { Test, TestingModule } from '@nestjs/testing';
import { SalesReportService } from './sales-report.service';
import { InternalServerErrorException } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';

describe('SalesReportService', () => {
  let service: SalesReportService;
  let model: jest.Mocked<any>;

  beforeEach(async () => {
    model = {
      create: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      findByIdAndDelete: jest.fn(),
      findById: jest.fn(),
      aggregate: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SalesReportService,
        {
          provide: OrdersModule,
          useValue: {
            aggregate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SalesReportService>(SalesReportService);
    model = module.get(model);
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

      model.aggregate.mockResolvedValue(expectedResult);

      const result = await service.generateDailySalesReport();
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors during report generation', async () => {
      model.aggregate.mockRejectedValue(new Error('Aggregation failed'));

      await expect(service.generateDailySalesReport()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
