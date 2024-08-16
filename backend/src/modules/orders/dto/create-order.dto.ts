import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemDto } from './item.dto';

export class CreateOrderDto {
  @ApiProperty({ description: 'The customer ID for the order' })
  @IsString()
  readonly customerId: string;

  @ApiProperty({ description: 'List of items in the order', type: [ItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemDto)
  readonly items: ItemDto[];
}
