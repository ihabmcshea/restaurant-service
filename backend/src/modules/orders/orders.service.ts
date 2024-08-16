import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from './schemas/order.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { RedisService } from '../redis/redis.service';
import { Item } from '../items/schemas/item.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel('Order') private readonly orderModel: Model<Order>,
    @InjectModel('Item') private readonly itemModel: Model<Item>,
    private readonly redisService: RedisService,
  ) {}

  async findAll(): Promise<Order[] | null> {
    const cacheKey = 'orders:all';
    try {
      const cachedOrders = await this.redisService.get(cacheKey);

      if (cachedOrders) {
        return JSON.parse(cachedOrders);
      }

      const orders = await this.orderModel.find().exec();
      await this.redisService.setExpirable(cacheKey, JSON.stringify(orders), 1); // cache for 1 hour
      return orders;
    } catch (error) {
      console.error('Failed to find all orders:', error);
      throw new InternalServerErrorException('Failed to retrieve orders');
    }
  }

  async findOne(id: string): Promise<Order | null> {
    const cacheKey = `order:${id}`;
    try {
      const cachedOrder = await this.redisService.get(cacheKey);

      if (cachedOrder) {
        return JSON.parse(cachedOrder);
      }

      const order = await this.orderModel.findById(id).exec();
      if (order) {
        await this.redisService.setExpirable(
          cacheKey,
          JSON.stringify(order),
          1,
        );
      }
      return order;
    } catch (error) {
      console.error(`Failed to find order with id ${id}:`, error);
      throw new InternalServerErrorException('Failed to retrieve order');
    }
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Validate and transform itemId
      const items = await Promise.all(
        createOrderDto.items.map(async (item) => {
          const itemId = new Types.ObjectId(item.itemId); // Convert to ObjectId
          const foundItem = await this.itemModel.findById(itemId);
          if (!foundItem) {
            throw new HttpException(
              `Item with ID ${item.itemId} not found`,
              HttpStatus.NOT_FOUND,
            );
          }
          return {
            item: foundItem,
            quantity: item.quantity,
            price: foundItem.price, // Assume the item schema has a price field
          };
        }),
      );

      const totalPrice = items.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0,
      );

      const newOrder = new this.orderModel({
        items,
        totalPrice,
      });

      return await newOrder.save();
    } catch (error) {
      console.error('Error creating order:', error);
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private generateOrderId(): string {
    return `ORD-${Date.now()}`;
  }

  async update(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order | null> {
    try {
      const order = await this.orderModel
        .findByIdAndUpdate(id, updateOrderDto, { new: true })
        .exec();
      if (order) {
        await this.redisService.setExpirable(
          `order:${id}`,
          JSON.stringify(order),
          1,
        );
        await this.redisService.delete('orders:all'); // Invalidate cache
      }
      return order;
    } catch (error) {
      console.error(`Failed to update order with id ${id}:`, error);
      throw new InternalServerErrorException('Failed to update order');
    }
  }

  async remove(id: string): Promise<void> {
    try {
      await this.orderModel.findByIdAndDelete(id).exec();
      await this.redisService.delete(`order:${id}`);
      await this.redisService.delete('orders:all'); // Invalidate cache
    } catch (error) {
      console.error(`Failed to delete order with id ${id}:`, error);
      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}
