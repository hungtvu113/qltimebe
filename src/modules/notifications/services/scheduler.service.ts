import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PublicEmailSubscription, PublicEmailSubscriptionDocument } from '../schemas/public-email-subscription.schema';
import { EmailService } from './email.service';
import { TasksService } from '../../tasks/tasks.service';
import { UsersService } from '../../users/users.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectModel(PublicEmailSubscription.name)
    private publicEmailSubscriptionModel: Model<PublicEmailSubscriptionDocument>,
    private emailService: EmailService,
    private tasksService: TasksService,
    private usersService: UsersService,
  ) {}

  // Chạy mỗi ngày lúc 8:00 AM
  @Cron('0 8 * * *', {
    name: 'daily-task-reminders',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async sendDailyTaskReminders() {
    this.logger.log('Bắt đầu gửi thông báo nhắc nhở hàng ngày...');
    
    try {
      // Gửi thông báo cho public subscriptions
      const publicResult = await this.sendPublicTaskReminders();
      
      // Gửi thông báo cho user subscriptions (đã có sẵn)
      const userResult = await this.sendUserTaskReminders();

      this.logger.log(`Hoàn thành gửi thông báo: Public(${publicResult.sent}/${publicResult.total}), User(${userResult.sent}/${userResult.failed})`);
    } catch (error) {
      this.logger.error('Lỗi khi gửi thông báo hàng ngày:', error);
    }
  }

  // Chạy mỗi 2 giờ để kiểm tra tasks sắp hết hạn
  @Cron('0 */2 * * *', {
    name: 'urgent-task-reminders',
    timeZone: 'Asia/Ho_Chi_Minh',
  })
  async sendUrgentTaskReminders() {
    this.logger.log('Kiểm tra tasks cần thông báo khẩn cấp...');
    
    try {
      // Chỉ gửi cho tasks hết hạn trong 4 giờ tới
      const publicResult = await this.sendPublicTaskReminders(4);
      
      if (publicResult.sent > 0) {
        this.logger.log(`Đã gửi ${publicResult.sent} thông báo khẩn cấp`);
      }
    } catch (error) {
      this.logger.error('Lỗi khi gửi thông báo khẩn cấp:', error);
    }
  }

  private async sendPublicTaskReminders(urgentHours?: number): Promise<{ sent: number; failed: number; total: number }> {
    let sent = 0;
    let failed = 0;

    // Lấy tất cả public email subscriptions đang active
    const subscriptions = await this.publicEmailSubscriptionModel.find({
      isActive: true,
      taskReminders: true,
    });

    this.logger.log(`Tìm thấy ${subscriptions.length} public email subscriptions`);

    for (const subscription of subscriptions) {
      try {
        // Tìm user có email này
        const user = await this.usersService.findByEmail(subscription.email);
        
        if (!user) {
          this.logger.debug(`Không tìm thấy user với email: ${subscription.email}`);
          continue;
        }

        // Sử dụng urgentHours nếu có, không thì dùng reminderHours từ subscription
        const hoursToCheck = urgentHours || subscription.reminderHours;

        // Lấy tasks sắp hết hạn của user
        const tasks = await this.tasksService.findTasksDueSoon((user as any)._id.toString(), hoursToCheck);

        if (tasks.length > 0) {
          // Kiểm tra đã gửi thông báo trong thời gian gần đây chưa
          const shouldSend = this.shouldSendReminder(subscription, urgentHours);

          if (shouldSend) {
            const success = await this.emailService.sendTaskReminderEmailPublic(
              subscription.email,
              subscription.name || 'Bạn',
              tasks,
              subscription.unsubscribeToken
            );

            if (success) {
              // Cập nhật thời gian gửi thông báo cuối
              subscription.lastNotificationSent = new Date();
              await subscription.save();
              sent++;
              
              this.logger.log(`Đã gửi thông báo cho ${subscription.email}: ${tasks.length} tasks`);
            } else {
              failed++;
              this.logger.error(`Gửi thông báo thất bại cho ${subscription.email}`);
            }
          } else {
            this.logger.debug(`Bỏ qua ${subscription.email} - đã gửi thông báo gần đây`);
          }
        }
      } catch (error) {
        this.logger.error(`Lỗi khi xử lý subscription ${subscription.email}:`, error);
        failed++;
      }
    }

    return { sent, failed, total: subscriptions.length };
  }

  private async sendUserTaskReminders(): Promise<{ sent: number; failed: number }> {
    // Sử dụng logic có sẵn từ NotificationsService
    // Có thể inject NotificationsService và gọi sendTaskReminders()
    return { sent: 0, failed: 0 };
  }

  private shouldSendReminder(subscription: PublicEmailSubscription, urgentHours?: number): boolean {
    if (!subscription.lastNotificationSent) {
      return true; // Chưa từng gửi
    }

    const now = new Date();
    const lastSent = new Date(subscription.lastNotificationSent);
    const hoursSinceLastSent = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

    if (urgentHours) {
      // Thông báo khẩn cấp: chỉ gửi nếu đã qua 2 giờ
      return hoursSinceLastSent >= 2;
    } else {
      // Thông báo thường: chỉ gửi nếu đã qua 12 giờ
      return hoursSinceLastSent >= 12;
    }
  }

  // Method để test thủ công
  async testSendReminders(): Promise<any> {
    this.logger.log('Test gửi thông báo thủ công...');
    return this.sendPublicTaskReminders();
  }
}
