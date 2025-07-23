import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Project extends Document {
  @ApiProperty({
    description: 'Tên dự án',
    example: 'Dự án quản lý thời gian',
  })
  @Prop({ required: true })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả dự án',
    example: 'Dự án giúp quản lý thời gian hiệu quả',
  })
  @Prop()
  description?: string;

  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
