import { ApiProperty } from '@nestjs/swagger';

export class TopSellingItemDto {
  @ApiProperty({ description: 'The ID of the item' })
  itemId: string;

  @ApiProperty({ description: 'The title of the item' })
  title: string;

  @ApiProperty({ description: 'The total quantity sold' })
  quantitySold: number;
}

export class DailySalesReportDto {
  @ApiProperty({ description: 'Total revenue generated for the day' })
  totalRevenue: number;

  @ApiProperty({ description: 'Total number of orders received for the day' })
  totalOrders: number;

  @ApiProperty({
    type: [TopSellingItemDto],
    description: 'List of top-selling items for the day',
  })
  topSellingItems: TopSellingItemDto[];
}
