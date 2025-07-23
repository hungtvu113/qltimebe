import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document & { _id: Types.ObjectId };

@Schema({ timestamps: true })
export class User {
  @ApiProperty({
    description: 'Tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Địa chỉ email',
    example: 'example@gmail.com',
  })
  @Prop({ required: true, unique: true })
  email: string;

  @ApiProperty({
    description: 'Mật khẩu đã được mã hóa',
  })
  @Prop({ required: true })
  password: string;

  @ApiProperty({
    description: 'URL hình đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  @Prop()
  avatar?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
