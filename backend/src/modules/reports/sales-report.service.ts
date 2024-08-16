import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage } from 'mongoose';
import { RedisService } from '../redis/redis.service';
import { DailySalesReportDto } from './dto/reports.dto';
import { Order } from '../orders/schemas/order.schema';

@Injectable()
export class SalesReportService {
  private readonly logger = new Logger(SalesReportService.name);

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    private readonly redisService: RedisService,
  ) {}

  private getStartAndEndOfToday(): { startDate: Date; endDate: Date } {
    const now = new Date();
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
    const endDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    return { startDate, endDate };
  }

  async generateDailySalesReport(): Promise<DailySalesReportDto> {
    // const { startDate, endDate } = this.getStartAndEndOfToday();
    // const cacheKey = `daily_sales_report_${startDate.toISOString()}_${endDate.toISOString()}`;
    // const cachedReport = await this.redisService.get(cacheKey);

    // if (cachedReport) {
    //   this.logger.log('Returning cached sales report');
    //   return JSON.parse(cachedReport) as DailySalesReportDto;
    // }
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);

    try {
      const pipeline: PipelineStage[] = [
        { $match: { createdAt: { $gte: startDate, $lt: endDate } } },
        { $unwind: { path: '$items' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' },
            totalOrders: { $sum: 1 },
            itemsSold: {
              $push: {
                itemId: '$items.item._id',
                title: '$items.item.title', // Assuming 'title' is available in items
                quantitySold: { $sum: '$items.quantity' },
              },
            },
          },
        },
        { $unwind: '$itemsSold' },
        {
          $group: {
            _id: '$itemsSold.itemId',
            title: { $first: '$itemsSold.title' },
            quantitySold: { $sum: '$itemsSold.quantitySold' },
          },
        },
        {
          $sort: { quantitySold: -1 }, // Sort by quantitySold descending
        },
        {
          $project: {
            _id: 0,
            title: 1,
            quantitySold: 1,
          },
        },
      ];

      const [report] = await this.orderModel.aggregate(pipeline).exec();

      if (!report) {
        throw new NotFoundException('No report found for today');
      }

      //   // Cache the report in Redis
      //   await this.redisService.setExpirable(
      //     cacheKey,
      //     JSON.stringify(report),
      //     24,
      //   ); // Cache for 24 hours

      return report as DailySalesReportDto;
    } catch (error) {
      this.logger.error('Error generating daily sales report', error.stack);
      throw new Error('Failed to generate daily sales report');
    }
  }
}
