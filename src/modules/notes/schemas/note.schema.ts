import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Note extends Document {
  @ApiProperty({
    description: 'Tiêu đề ghi chú',
    example: 'Ý tưởng dự án mới',
  })
  @Prop({ required: true })
  title: string;

  @ApiProperty({
    description: 'Nội dung ghi chú',
    example: 'Chi tiết về ý tưởng dự án quản lý thời gian...',
  })
  @Prop({ required: true })
  content: string;

  @ApiPropertyOptional({
    description: 'Danh sách thẻ',
    example: ['ý tưởng', 'dự án'],
  })
  @Prop([String])
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Mã màu',
    example: '#4CAF50',
  })
  @Prop()
  color?: string;

  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
