import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ItemDto } from './item.dto';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto) {
  @ApiProperty({
    description: 'The customer ID for the order',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly customerId?: string;

  @ApiProperty({
    description: 'List of items in the order',
    type: [ItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  readonly items?: ItemDto[];

  @ApiProperty({
    description: 'The total price of the order',
    example: 99.99,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  readonly totalPrice?: number;
}
