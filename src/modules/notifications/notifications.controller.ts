import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './services/notifications.service';
import { SchedulerService } from './services/scheduler.service';
import { SubscribeEmailDto, UpdateEmailSubscriptionDto } from './dto/subscribe-email.dto';
import { PublicSubscribeEmailDto } from './dto/public-subscribe-email.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('notifications')
@Controller('api/notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly schedulerService: SchedulerService,
  ) {}

  @Post('email/subscribe')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng ký nhận thông báo email (yêu cầu đăng nhập)' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async subscribeEmail(@Request() req, @Body() subscribeDto: SubscribeEmailDto) {
    return this.notificationsService.subscribeEmail(req.user.userId, subscribeDto);
  }

  @Post('email/subscribe-public')
  @ApiOperation({ summary: 'Đăng ký nhận thông báo email (không cần đăng nhập)' })
  @ApiResponse({ status: 201, description: 'Đăng ký thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  async subscribeEmailPublic(@Body() subscribeDto: PublicSubscribeEmailDto) {
    return this.notificationsService.subscribeEmailPublic(subscribeDto);
  }

  @Get('email/subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách đăng ký email' })
  @ApiResponse({ status: 200, description: 'Lấy danh sách thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getSubscriptions(@Request() req) {
    return this.notificationsService.getSubscription(req.user.userId);
  }

  @Put('email/subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật đăng ký email' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async updateSubscription(
    @Request() req,
    @Param('id') id: string,
    @Body() updateDto: UpdateEmailSubscriptionDto,
  ) {
    return this.notificationsService.updateSubscription(req.user.userId, id, updateDto);
  }

  @Delete('email/subscriptions/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa đăng ký email' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy đăng ký' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async deleteSubscription(@Request() req, @Param('id') id: string) {
    return this.notificationsService.deleteSubscription(req.user.userId, id);
  }

  @Post('email/unsubscribe')
  @ApiOperation({ summary: 'Hủy đăng ký email bằng token' })
  @ApiResponse({ status: 200, description: 'Hủy đăng ký thành công' })
  @ApiResponse({ status: 404, description: 'Token không hợp lệ' })
  async unsubscribe(@Query('token') token: string) {
    return this.notificationsService.unsubscribe(token);
  }

  @Post('email/send-reminders')
  @ApiOperation({ summary: 'Gửi thông báo nhắc nhở (dành cho cron job)' })
  @ApiResponse({ status: 200, description: 'Gửi thông báo thành công' })
  async sendReminders() {
    return this.notificationsService.sendTaskReminders();
  }

  @Post('test-scheduler')
  @ApiOperation({ summary: 'Test gửi thông báo thủ công' })
  @ApiResponse({ status: 200, description: 'Test thành công' })
  async testScheduler() {
    return this.schedulerService.testSendReminders();
  }
}
