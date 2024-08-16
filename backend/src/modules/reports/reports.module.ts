import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { SalesReportService } from './sales-report.service';
import { ReportsController } from './sales-report.controller';
import { RedisModule } from '../redis/redis.module';
// import { ReportsController } from './reports.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    RedisModule,
  ],
  controllers: [ReportsController],
  providers: [SalesReportService],
})
export class ReportsModule {}
