import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { DailySalesReportDto } from './dto/reports.dto';
import { Order } from '../orders/schemas/order.schema';
import logger from '../../common/logging/winston-logger';

@Injectable()
export class SalesReportService {
  private readonly logger = new Logger(SalesReportService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly redisService: RedisService,
  ) {}

  async generateDailySalesReport(): Promise<DailySalesReportDto> {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    const cacheKey = `daily_sales_report_${startDate.toISOString()}_${endDate.toISOString()}`;
    try {
      const cachedReport = await this.redisService.get(cacheKey);
      // if (cachedReport) {
      // this.logger.log('Returning cached sales report');
      // return JSON.parse(cachedReport) as DailySalesReportDto;
      // }

      const pipeline: PipelineStage[] = [
        {
          $match: {
            createdAt: { $gte: startDate, $lt: endDate },
          },
        },
        {
          $unwind: '$items', // Unwind the items array
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            itemsSold: {
              $push: {
                itemId: '$items.item._id',
                title: '$items.item.title',
                quantitySold: '$items.quantity',
              },
            },
          },
        },
        {
          $addFields: {
            itemsSold: {
              $map: {
                input: { $setUnion: ['$itemsSold.itemId'] }, // Ensure unique items
                as: 'itemId',
                in: {
                  itemId: '$$itemId',
                  title: {
                    $arrayElemAt: [
                      {
                        $filter: {
                          input: '$itemsSold',
                          as: 'item',
                          cond: { $eq: ['$$item.itemId', '$$itemId'] },
                        },
                      },
                      0,
                    ],
                  },
                  quantitySold: {
                    $sum: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$itemsSold',
                            as: 'item',
                            cond: { $eq: ['$$item.itemId', '$$itemId'] },
                          },
                        },
                        as: 'item',
                        in: '$$item.quantitySold',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        {
          $addFields: {
            itemsSold: {
              $map: {
                input: '$itemsSold',
                as: 'item',
                in: {
                  itemId: '$$item.itemId',
                  title: '$$item.title.title',
                  quantitySold: '$$item.quantitySold',
                },
              },
            },
          },
        },
        {
          $addFields: {
            itemsSold: {
              $sortArray: {
                input: '$itemsSold',
                sortBy: { quantitySold: -1 }, // Sort by quantitySold in descending order
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalRevenue: 1,
            totalOrders: 1,
            itemsSold: {
              itemId: 1,
              title: 1,
              quantitySold: 1,
            },
          },
        },
      ];

      const [report] = await this.orderModel.aggregate(pipeline).exec();

      if (!report) {
        throw new NotFoundException('No report found for today');
      }

      // Cache the report in Redis
      await this.redisService.setExpirable(cacheKey, JSON.stringify(report), 1); // Cache for 1 hour

      return report as DailySalesReportDto;
    } catch (error) {
      logger.error('Error generating daily sales report', error.stack);
      throw new InternalServerErrorException(
        'Failed to generate daily sales report',
      );
    }
  }
}
