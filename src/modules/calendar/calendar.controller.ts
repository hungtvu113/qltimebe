import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalendarQueryDto } from './dto/calendar-query.dto';

@ApiTags('Lịch')
@Controller('api/calendar')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'Lấy danh sách sự kiện lịch' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'start', required: false, description: 'Ngày bắt đầu (YYYY-MM-DD)' })
  @ApiQuery({ name: 'end', required: false, description: 'Ngày kết thúc (YYYY-MM-DD)' })
  getEvents(
    @GetUser() user: UserDocument,
    @Query() query: CalendarQueryDto,
  ) {
    const start = query.start || new Date().toISOString().split('T')[0];
    const end = query.end || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0];
    
    return this.calendarService.getCalendarData(user._id.toString(), start, end);
  }

  @Get('day/:date')
  @ApiOperation({ summary: 'Lấy dữ liệu cho một ngày cụ thể' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  getDayData(
    @GetUser() user: UserDocument,
    @Param('date') date: string,
  ) {
    return this.calendarService.getDayData(user._id.toString(), date);
  }

  @Get('week/:date')
  @ApiOperation({ summary: 'Lấy dữ liệu cho một tuần (từ ngày được chỉ định)' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  getWeekData(
    @GetUser() user: UserDocument,
    @Param('date') date: string,
  ) {
    return this.calendarService.getWeekData(user._id.toString(), date);
  }
}
