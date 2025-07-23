import { IsNotEmpty, IsString, IsOptional, IsArray, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({
    description: 'Tiêu đề ghi chú',
    example: 'Ý tưởng dự án mới',
  })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString({ message: 'Tiêu đề phải là chuỗi' })
  title: string;

  @ApiProperty({
    description: 'Nội dung ghi chú',
    example: 'Chi tiết về ý tưởng dự án quản lý thời gian...',
  })
  @IsNotEmpty({ message: 'Nội dung không được để trống' })
  @IsString({ message: 'Nội dung phải là chuỗi' })
  content: string;

  @ApiPropertyOptional({
    description: 'Danh sách thẻ',
    example: ['ý tưởng', 'dự án'],
  })
  @IsOptional()
  @IsArray({ message: 'Tags phải là mảng' })
  @IsString({ each: true, message: 'Mỗi thẻ phải là chuỗi' })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Mã màu',
    example: '#4CAF50',
  })
  @IsOptional()
  @IsHexColor({ message: 'Mã màu phải là mã hex hợp lệ' })
  color?: string;
}
