import { CacheModule } from '@nestjs/cache-manager';
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';
import { ItemsModule } from '../items/items.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrdersModule } from '../orders/orders.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GLOBAL_CONFIG } from '../../config/global.config';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { ReportsModule } from '../reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => GLOBAL_CONFIG],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: `mongodb://admin:adminPass@mongodb:27017/restaurant_db?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false`,
      }),
      inject: [ConfigService],
    }),

    ItemsModule,
    ReportsModule,
    OrdersModule,
    ElasticsearchModule,
    CacheModule.registerAsync({
      useFactory: (configService: ConfigService) =>
        ({
          store: redisStore,
          url: 'redis://redis:6379',
        }) as RedisClientOptions,
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply().forRoutes('*');
  }
}
