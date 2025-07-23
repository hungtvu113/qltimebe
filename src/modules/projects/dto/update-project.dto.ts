import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Tên dự án',
    example: 'Dự án quản lý thời gian (cập nhật)',
  })
  @IsOptional()
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả dự án',
    example: 'Mô tả cập nhật cho dự án quản lý thời gian',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;
}
