import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDate, IsEnum, IsArray, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, ScrumTaskStatus } from '../schemas/task.schema';

export class CreateTaskDto {
  @ApiProperty({
    description: 'Tiêu đề công việc',
    example: 'Hoàn thành báo cáo',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  @ApiPropertyOptional({
    description: 'Mô tả công việc',
    example: 'Chi tiết về các nội dung cần có trong báo cáo',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Trạng thái hoàn thành',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoàn thành phải là boolean' })
  completed?: boolean;

  @ApiPropertyOptional({
    description: 'Ngày đến hạn',
    example: '2025-06-15T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate({ message: 'Ngày đến hạn phải là ngày hợp lệ' })
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Mức độ ưu tiên',
    enum: ['low', 'medium', 'high'],
    example: 'medium',
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high'], { message: 'Mức độ ưu tiên không hợp lệ' })
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'ID danh mục',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId({ message: 'ID danh mục không hợp lệ' })
  category?: string;

  @ApiPropertyOptional({
    description: 'Danh sách thẻ',
    example: ['công việc', 'báo cáo'],
  })
  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi thẻ phải là chuỗi' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Trạng thái Scrum',
    enum: ['backlog', 'todo', 'doing', 'done'],
    example: 'todo',
  })
  @IsOptional()
  @IsEnum(['backlog', 'todo', 'doing', 'done'], { message: 'Trạng thái Scrum không hợp lệ' })
  status?: ScrumTaskStatus;

  @ApiPropertyOptional({
    description: 'ID dự án',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @IsMongoId({ message: 'ID dự án không hợp lệ' })
  project?: string;
}
