import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticsService } from './statistics.service';
import { StatisticsQueryDto } from './dto/statistics-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Thống kê')
@Controller('api/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('tasks')
  @ApiOperation({ summary: 'Lấy thống kê về công việc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  async getTasksStatistics(
    @GetUser() user: UserDocument,
    @Query() query: StatisticsQueryDto,
  ) {
    return await this.statisticsService.getTasksStatistics(
      user._id.toString(),
      query.startDate,
      query.endDate,
    );
  }

  @Get('time-blocks')
  @ApiOperation({ summary: 'Lấy thống kê về khối thời gian' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  async getTimeBlocksStatistics(
    @GetUser() user: UserDocument,
    @Query() query: StatisticsQueryDto,
  ) {
    return await this.statisticsService.getTimeBlocksStatistics(
      user._id.toString(),
      query.startDate,
      query.endDate,
    );
  }

  @Get('productivity')
  @ApiOperation({ summary: 'Lấy thống kê về năng suất' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'startDate', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  async getProductivityStatistics(
    @GetUser() user: UserDocument,
    @Query() query: StatisticsQueryDto,
  ) {
    return await this.statisticsService.getProductivityStatistics(
      user._id.toString(),
      query.startDate,
      query.endDate,
    );
  }
}
