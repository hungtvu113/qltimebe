import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Tên dự án',
    example: 'Dự án quản lý thời gian',
  })
  @IsNotEmpty({ message: 'Tên dự án không được để trống' })
  @IsString({ message: 'Tên dự án phải là chuỗi' })
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả dự án',
    example: 'Dự án giúp quản lý thời gian hiệu quả',
  })
  @IsOptional()
  @IsString({ message: 'Mô tả dự án phải là chuỗi' })
  description?: string;
}
