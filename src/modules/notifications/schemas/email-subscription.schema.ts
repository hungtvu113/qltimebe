import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailSubscriptionDocument = EmailSubscription & Document;

@Schema({ timestamps: true })
export class EmailSubscription {
  @Prop({ required: true })
  email: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

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

  @Prop()
  unsubscribeToken: string; // Token để hủy đăng ký

  @Prop()
  lastNotificationSent: Date; // Lần cuối gửi thông báo
}

export const EmailSubscriptionSchema = SchemaFactory.createForClass(EmailSubscription);

// Index để tìm kiếm nhanh
EmailSubscriptionSchema.index({ email: 1 });
EmailSubscriptionSchema.index({ user: 1 });
EmailSubscriptionSchema.index({ isActive: 1 });
EmailSubscriptionSchema.index({ unsubscribeToken: 1 });
