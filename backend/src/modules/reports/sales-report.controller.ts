import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SalesReportService } from './sales-report.service';
import { DailySalesReportDto } from './dto/reports.dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly salesReportService: SalesReportService) {}

  @Get('daily-sales')
  @ApiOperation({ summary: 'Generate daily sales report' })
  @ApiResponse({
    status: 200,
    description: 'Daily sales report generated successfully',
    type: DailySalesReportDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to generate daily sales report',
  })
  async getDailySalesReport(): Promise<DailySalesReportDto> {
    try {
      return await this.salesReportService.generateDailySalesReport();
    } catch (error) {
      console.error('Error generating daily sales report:', error);
      throw new HttpException(
        'Failed to generate daily sales report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
