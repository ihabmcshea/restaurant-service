import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { Item } from './schemas/item.schema';
import { ItemsService } from './items.service';
import logger from '../../common/logging/winston-logger';

@ApiTags('items')
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new item' })
  @ApiResponse({
    status: 201,
    description: 'The item has been successfully created.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createItemDto: CreateItemDto): Promise<Item> {
    try {
      return await this.itemsService.create(createItemDto);
    } catch (error) {
      logger.error('Failed to create item:', error);
      throw new InternalServerErrorException('Failed to create item');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all items' })
  @ApiResponse({ status: 200, description: 'List of items.' })
  async findAll(): Promise<Item[]> {
    try {
      return await this.itemsService.findAll();
    } catch (error) {
      logger.error('Failed to retrieve all items:', error);
      throw new InternalServerErrorException('Failed to retrieve items');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a single item by ID' })
  @ApiParam({ name: 'id', description: 'ID of the item to retrieve' })
  @ApiResponse({ status: 200, description: 'The item with the specified ID.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async findOne(@Param('id') id: string): Promise<Item | null> {
    try {
      const item = await this.itemsService.findOne(id);
      if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }
      return item;
    } catch (error) {
      logger.error(`Failed to retrieve item with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve item');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an item by ID' })
  @ApiParam({ name: 'id', description: 'ID of the item to update' })
  @ApiResponse({ status: 200, description: 'The updated item.' })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async update(
    @Param('id') id: string,
    @Body() updateItemDto: UpdateItemDto,
  ): Promise<Item | null> {
    try {
      const item = await this.itemsService.update(id, updateItemDto);
      if (!item) {
        throw new NotFoundException(`Item with ID ${id} not found`);
      }
      return item;
    } catch (error) {
      logger.error(`Failed to update item with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to update item');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an item by ID' })
  @ApiParam({ name: 'id', description: 'ID of the item to delete' })
  @ApiResponse({
    status: 204,
    description: 'The item has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Item not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.itemsService.remove(id);
    } catch (error) {
      logger.error(`Failed to delete item with ID ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete item');
    }
  }
}
