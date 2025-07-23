import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EmailSubscription, EmailSubscriptionDocument } from '../schemas/email-subscription.schema';
import { PublicEmailSubscription, PublicEmailSubscriptionDocument } from '../schemas/public-email-subscription.schema';
import { SubscribeEmailDto, UpdateEmailSubscriptionDto } from '../dto/subscribe-email.dto';
import { PublicSubscribeEmailDto } from '../dto/public-subscribe-email.dto';
import { EmailService } from './email.service';
import { TasksService } from '../../tasks/tasks.service';
import { UsersService } from '../../users/users.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(EmailSubscription.name)
    private emailSubscriptionModel: Model<EmailSubscriptionDocument>,
    @InjectModel(PublicEmailSubscription.name)
    private publicEmailSubscriptionModel: Model<PublicEmailSubscriptionDocument>,
    private emailService: EmailService,
    private tasksService: TasksService,
    private usersService: UsersService,
  ) {}

  async subscribeEmail(userId: string, subscribeDto: SubscribeEmailDto): Promise<EmailSubscription> {
    // Kiểm tra user tồn tại
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    // Kiểm tra email đã đăng ký chưa
    const existingSubscription = await this.emailSubscriptionModel.findOne({
      user: new Types.ObjectId(userId),
      email: subscribeDto.email,
    });

    if (existingSubscription) {
      // Nếu đã tồn tại, cập nhật thông tin
      Object.assign(existingSubscription, {
        ...subscribeDto,
        isActive: true,
        unsubscribeToken: uuidv4(),
      });
      await existingSubscription.save();
      
      // Gửi email chào mừng
      await this.emailService.sendWelcomeEmail(subscribeDto.email, user.name);
      
      return existingSubscription;
    }

    // Tạo đăng ký mới
    const subscription = new this.emailSubscriptionModel({
      ...subscribeDto,
      user: new Types.ObjectId(userId),
      unsubscribeToken: uuidv4(),
      taskReminders: subscribeDto.taskReminders ?? true,
      dailySummary: subscribeDto.dailySummary ?? false,
      weeklyReport: subscribeDto.weeklyReport ?? false,
      reminderHours: subscribeDto.reminderHours ?? 24,
    });

    await subscription.save();

    // Gửi email chào mừng
    await this.emailService.sendWelcomeEmail(subscribeDto.email, user.name);

    return subscription;
  }

  async subscribeEmailPublic(subscribeDto: PublicSubscribeEmailDto): Promise<PublicEmailSubscription> {
    // Kiểm tra email đã đăng ký chưa
    const existingSubscription = await this.publicEmailSubscriptionModel.findOne({
      email: subscribeDto.email,
    });

    if (existingSubscription) {
      // Nếu đã tồn tại, cập nhật thông tin
      Object.assign(existingSubscription, {
        ...subscribeDto,
        isActive: true,
        unsubscribeToken: uuidv4(),
        verificationToken: uuidv4(),
      });
      await existingSubscription.save();

      // Gửi email chào mừng
      await this.emailService.sendWelcomeEmailPublic(
        subscribeDto.email,
        subscribeDto.name || 'Bạn',
        existingSubscription.unsubscribeToken
      );

      return existingSubscription;
    }

    // Tạo đăng ký mới
    const subscription = new this.publicEmailSubscriptionModel({
      ...subscribeDto,
      unsubscribeToken: uuidv4(),
      verificationToken: uuidv4(),
      taskReminders: subscribeDto.taskReminders ?? true,
      dailySummary: subscribeDto.dailySummary ?? false,
      weeklyReport: subscribeDto.weeklyReport ?? false,
      reminderHours: subscribeDto.reminderHours ?? 24,
      emailVerified: false,
    });

    await subscription.save();

    // Gửi email chào mừng
    await this.emailService.sendWelcomeEmailPublic(
      subscribeDto.email,
      subscribeDto.name || 'Bạn',
      subscription.unsubscribeToken
    );

    return subscription;
  }

  async getSubscription(userId: string): Promise<EmailSubscription[]> {
    return this.emailSubscriptionModel.find({
      user: new Types.ObjectId(userId),
    }).exec();
  }

  async updateSubscription(
    userId: string,
    subscriptionId: string,
    updateDto: UpdateEmailSubscriptionDto,
  ): Promise<EmailSubscription> {
    const subscription = await this.emailSubscriptionModel.findOne({
      _id: new Types.ObjectId(subscriptionId),
      user: new Types.ObjectId(userId),
    });

    if (!subscription) {
      throw new NotFoundException('Đăng ký email không tồn tại');
    }

    Object.assign(subscription, updateDto);
    await subscription.save();

    return subscription;
  }

  async unsubscribe(token: string): Promise<{ message: string }> {
    const subscription = await this.emailSubscriptionModel.findOne({
      unsubscribeToken: token,
    });

    if (!subscription) {
      throw new NotFoundException('Token hủy đăng ký không hợp lệ');
    }

    subscription.isActive = false;
    await subscription.save();

    return { message: 'Đã hủy đăng ký thành công' };
  }

  async sendTaskReminders(): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    // Lấy tất cả đăng ký email active với taskReminders = true
    const subscriptions = await this.emailSubscriptionModel.find({
      isActive: true,
      taskReminders: true,
    }).populate('user');

    for (const subscription of subscriptions) {
      try {
        // Tính thời gian nhắc nhở
        const reminderTime = new Date();
        reminderTime.setHours(reminderTime.getHours() + subscription.reminderHours);

        // Lấy các task sắp hết hạn của user
        const tasks = await this.tasksService.findTasksDueSoon(
          subscription.user.toString(),
          subscription.reminderHours,
        );

        if (tasks.length > 0) {
          // Kiểm tra đã gửi thông báo trong 12h qua chưa
          const lastSent = subscription.lastNotificationSent;
          const twelveHoursAgo = new Date();
          twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12);

          if (!lastSent || lastSent < twelveHoursAgo) {
            const success = await this.emailService.sendTaskReminderEmail(
              subscription.email,
              tasks,
            );

            if (success) {
              subscription.lastNotificationSent = new Date();
              await subscription.save();
              sent++;
            } else {
              failed++;
            }
          }
        }
      } catch (error) {
        console.error(`Failed to send reminder to ${subscription.email}:`, error);
        failed++;
      }
    }

    return { sent, failed };
  }

  async deleteSubscription(userId: string, subscriptionId: string): Promise<{ message: string }> {
    const result = await this.emailSubscriptionModel.deleteOne({
      _id: new Types.ObjectId(subscriptionId),
      user: new Types.ObjectId(userId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException('Đăng ký email không tồn tại');
    }

    return { message: 'Đã xóa đăng ký email thành công' };
  }
}
