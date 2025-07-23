import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PublicEmailSubscriptionDocument = PublicEmailSubscription & Document;

@Schema({ timestamps: true })
export class PublicEmailSubscription {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: true })
  taskReminders: boolean; // Nhắc nhở công việc sắp hết hạn

  @Prop({ default: false })
  dailySummary: boolean; // Tóm tắt hàng ngày

  @Prop({ default: false })
  weeklyReport: boolean; // Báo cáo hàng tuần

  @Prop({ default: 24 })
  reminderHours: number; // Số giờ trước khi nhắc nhở (mặc định 24h)

  @Prop({ required: true })
  unsubscribeToken: string; // Token để hủy đăng ký

  @Prop()
  lastNotificationSent: Date; // Lần cuối gửi thông báo

  @Prop()
  name: string; // Tên người đăng ký (optional)

  @Prop({ default: false })
  emailVerified: boolean; // Xác thực email

  @Prop()
  verificationToken: string; // Token xác thực email
}

export const PublicEmailSubscriptionSchema = SchemaFactory.createForClass(PublicEmailSubscription);

// Index để tìm kiếm nhanh
PublicEmailSubscriptionSchema.index({ email: 1 });
PublicEmailSubscriptionSchema.index({ isActive: 1 });
PublicEmailSubscriptionSchema.index({ unsubscribeToken: 1 });
PublicEmailSubscriptionSchema.index({ verificationToken: 1 });
