import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItemSchema } from './schemas/item.schema';
import { ItemsService } from './items.service';
import { ItemsController } from './items.controller';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Item', schema: ItemSchema }]),
    RedisModule,
  ],
  providers: [ItemsService],
  controllers: [ItemsController],
  exports: [ItemsService, MongooseModule],
})
export class ItemsModule {}
