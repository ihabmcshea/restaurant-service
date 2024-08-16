import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './schemas/order.schema';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({
    status: 201,
    description: 'Order successfully created',
    type: Order,
  })
  @ApiResponse({ status: 500, description: 'Failed to create order' })
  @ApiBody({ type: CreateOrderDto })
  async create(@Body() createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      return await this.ordersService.create(createOrderDto);
    } catch (error) {
      console.error('Error creating order:', error);
      throw new HttpException(
        'Failed to create order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders retrieved successfully',
    type: [Order],
  })
  @ApiResponse({ status: 500, description: 'Failed to retrieve orders' })
  async findAll(): Promise<Order[] | null> {
    try {
      return await this.ordersService.findAll();
    } catch (error) {
      console.error('Error finding orders:', error);
      throw new HttpException(
        'Failed to retrieve orders',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order retrieved successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve order' })
  @ApiParam({ name: 'id', description: 'The ID of the order to retrieve' })
  async findOne(@Param('id') id: string): Promise<Order | null> {
    try {
      return await this.ordersService.findOne(id);
    } catch (error) {
      console.error(`Error finding order with id ${id}:`, error);
      throw new HttpException(
        'Failed to retrieve order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order updated successfully',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Failed to update order' })
  @ApiParam({ name: 'id', description: 'The ID of the order to update' })
  @ApiBody({ type: UpdateOrderDto })
  async update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<Order | null> {
    try {
      return await this.ordersService.update(id, updateOrderDto);
    } catch (error) {
      console.error(`Error updating order with id ${id}:`, error);
      throw new HttpException(
        'Failed to update order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order by ID' })
  @ApiResponse({ status: 200, description: 'Order deleted successfully' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete order' })
  @ApiParam({ name: 'id', description: 'The ID of the order to delete' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.ordersService.remove(id);
    } catch (error) {
      console.error(`Error deleting order with id ${id}:`, error);
      throw new HttpException(
        'Failed to delete order',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
