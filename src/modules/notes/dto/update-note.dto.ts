import { IsOptional, IsString, IsArray, IsHexColor } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({
    description: 'Tiêu đề ghi chú',
    example: 'Ý tưởng dự án mới (cập nhật)',
  })
  @IsOptional()
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Nội dung ghi chú',
    example: 'Nội dung cập nhật về ý tưởng dự án...',
  })
  @IsOptional()
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content?: string;

  @ApiPropertyOptional({
    description: 'Danh sách thẻ',
    example: ['ý tưởng', 'dự án', 'quan trọng'],
  })
  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi thẻ phải là chuỗi' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Mã màu',
    example: '#2196F3',
  })
  @IsOptional()
  @IsHexColor({ message: 'Mã màu phải là mã hex hợp lệ' })
  color?: string;
}
