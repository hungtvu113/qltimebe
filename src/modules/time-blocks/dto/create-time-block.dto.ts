import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsDate, IsMongoId, ValidateIf } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimeBlockDto {
  @ApiProperty({
    description: 'Tiêu đề khối thời gian',
    example: 'Họp dự án',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  @ApiProperty({
    description: 'Thời gian bắt đầu',
    example: '2025-06-15T09:00:00.000Z',
  })
  @IsNotEmpty({ message: 'Thời gian bắt đầu không được để trống' })
  @IsDate({ message: 'Thời gian bắt đầu phải là ngày hợp lệ' })
  @Type(() => Date)
  startTime: Date;

  @ApiProperty({
    description: 'Thời gian kết thúc',
    example: '2025-06-15T10:30:00.000Z',
  })
  @IsNotEmpty({ message: 'Thời gian kết thúc không được để trống' })
  @IsDate({ message: 'Thời gian kết thúc phải là ngày hợp lệ' })
  @Type(() => Date)
  endTime: Date;

  @ApiPropertyOptional({
    description: 'Trạng thái hoàn thành',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hoàn thành phải là boolean' })
  isCompleted?: boolean;

  @ApiPropertyOptional({
    description: 'ID công việc liên quan',
    example: '60d21b4667d0d8992e610c85',
  })
  @IsOptional()
  @ValidateIf((o) => o.taskId !== null && o.taskId !== undefined && o.taskId !== '')
  @IsMongoId({ message: 'ID công việc không hợp lệ' })
  taskId?: string | null;
}
