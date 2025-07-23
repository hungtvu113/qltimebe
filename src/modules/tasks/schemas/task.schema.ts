import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export type TaskPriority = 'low' | 'medium' | 'high';
export type ScrumTaskStatus = 'backlog' | 'todo' | 'doing' | 'done';

@Schema({ timestamps: true })
export class Task extends Document {
  @ApiProperty({
    description: 'Tiêu đề công việc',
    example: 'Hoàn thành báo cáo',
  })
  @Prop({ required: true })
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả công việc',
    example: 'Chi tiết về các nội dung cần có trong báo cáo',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'Trạng thái hoàn thành',
    example: false,
  })
  @Prop({ default: false })
  completed: boolean;

  @ApiPropertyOptional({
    description: 'Ngày đến hạn',
    example: '2025-06-15T00:00:00.000Z',
  })
  @Prop()
  dueDate?: Date;

  @ApiProperty({
    description: 'Mức độ ưu tiên',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @Prop({ required: true, enum: ['low', 'medium', 'high'], default: 'medium' })
  priority: TaskPriority;

  @ApiPropertyOptional({
    description: 'Danh mục',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Category' })
  category?: MongooseSchema.Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Danh sách thẻ',
    example: ['công việc', 'báo cáo'],
  })
  @Prop([String])
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Trạng thái Scrum',
    enum: ['backlog', 'todo', 'doing', 'done'],
    example: 'todo',
  })
  @Prop({ enum: ['backlog', 'todo', 'doing', 'done'], default: 'todo' })
  status?: ScrumTaskStatus;

  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;

  @ApiPropertyOptional({
    description: 'Dự án',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Project' })
  project?: MongooseSchema.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Transform _id thành id khi serialize
TaskSchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  }
});
