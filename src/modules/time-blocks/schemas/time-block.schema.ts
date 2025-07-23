import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class TimeBlock extends Document {
  @ApiProperty({
    description: 'Tiêu đề khối thời gian',
    example: 'Họp dự án',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2025-06-15T09:00:00.000Z',
  })
  @Prop({ required: true })
  startTime: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2025-06-15T10:30:00.000Z',
  })
  @Prop({ required: true })
  endTime: Date;

  @ApiProperty({
    description: 'Trạng thái hoàn thành',
    example: false,
  })
  @Prop({ default: false })
  isCompleted: boolean;

  @ApiPropertyOptional({
    description: 'Công việc liên quan',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Task' })
  taskId?: MongooseSchema.Types.ObjectId;

  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;
}

export const TimeBlockSchema = SchemaFactory.createForClass(TimeBlock);
