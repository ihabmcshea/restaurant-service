import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber } from 'class-validator';

export class ItemDto {
  @ApiProperty({
    description: 'The ID of the item',
    example: '60b8d295f5b4b9d6a4b5e1b6',
  })
  @IsString()
  readonly itemId: string;

  @ApiProperty({ description: 'The quantity of the item', example: 3 })
  @IsNumber()
  readonly quantity: number;
}
