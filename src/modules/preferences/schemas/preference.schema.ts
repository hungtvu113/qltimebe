import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ThemeType = 'light' | 'dark' | 'system';
export type CalendarViewType = 'day' | 'week' | 'month';
export type StartOfWeekType = 0 | 1 | 6; // 0: Sunday, 1: Monday, 6: Saturday

export type PreferenceDocument = Preference & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class Preference {
  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true })
  user: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: 'Chủ đề',
    enum: ['light', 'dark', 'system'],
    example: 'system',
  })
  @Prop({ enum: ['light', 'dark', 'system'], default: 'system' })
  theme: ThemeType;

  @ApiProperty({
    description: 'Ngôn ngữ',
    example: 'vi',
  })
  @Prop({ default: 'vi' })
  language: string;

  @ApiProperty({
    description: 'Bật/tắt thông báo',
    example: true,
  })
  @Prop({ default: true })
  notifications: boolean;

  @ApiProperty({
    description: 'Chế độ xem lịch mặc định',
    enum: ['day', 'week', 'month'],
    example: 'week',
  })
  @Prop({ enum: ['day', 'week', 'month'], default: 'week' })
  calendarView: CalendarViewType;

  @ApiProperty({
    description: 'Ngày bắt đầu tuần',
    enum: [0, 1, 6],
    example: 1,
  })
  @Prop({ enum: [0, 1, 6], default: 1 })
  startOfWeek: StartOfWeekType;

  @ApiProperty({
    description: 'Hiển thị công việc đã hoàn thành',
    example: true,
  })
  @Prop({ default: true })
  showCompletedTasks: boolean;
}

export const PreferenceSchema = SchemaFactory.createForClass(Preference);
