import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

@Schema({ timestamps: true })
export class Category extends Document {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Công việc',
  })
  @Prop({ required: true })
  name: string;

  @ApiProperty({
    description: 'Mã màu',
    example: '#4CAF50',
  })
  @Prop({ required: true })
  color: string;

  @ApiProperty({
    description: 'Người dùng sở hữu',
    example: '60d21b4667d0d8992e610c85',
  })
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: MongooseSchema.Types.ObjectId;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

// Transform _id thành id khi serialize
CategorySchema.set('toJSON', {
  transform: function(doc, ret) {
    ret.id = ret._id;
    delete (ret as any)._id;
    delete (ret as any).__v;
    return ret;
  }
});
