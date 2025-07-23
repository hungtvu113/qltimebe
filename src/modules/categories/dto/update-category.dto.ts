import { IsOptional, IsString, IsHexColor } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    description: 'Tên danh mục',
    example: 'Công việc (cập nhật)',
  })
  @IsOptional()
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Mã màu',
    example: '#2196F3',
  })
  @IsOptional()
  @IsHexColor({ message: 'Mã màu phải là mã hex hợp lệ' })
  color?: string;
}
