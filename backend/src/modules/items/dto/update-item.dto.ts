import { IsString, IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateItemDto {
  @ApiPropertyOptional({
    description: 'The title of the item',
    example: 'Deluxe Pizza',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'A brief description of the item',
    example: 'A pizza topped with cheese, pepperoni, and olives.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'The price of the item',
    example: 12.99,
  })
  @IsOptional()
  @IsNumber()
  price?: number;
}
