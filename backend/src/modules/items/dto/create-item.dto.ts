import { IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateItemDto {
  @ApiProperty({
    description: 'The title of the item',
    example: 'Deluxe Pizza',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'A brief description of the item',
    example: 'A pizza topped with cheese, pepperoni, and olives.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'The price of the item',
    example: 12.99,
  })
  @IsNumber()
  price: number;
}
