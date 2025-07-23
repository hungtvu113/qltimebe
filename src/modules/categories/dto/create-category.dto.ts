import { IsNotEmpty, IsString, IsHexColor } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Tên danh mục',
    example: 'Công việc',
  })
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi' })
  name: string;

  @ApiProperty({
    description: 'Mã màu',
    example: '#4CAF50',
  })
  @IsNotEmpty({ message: 'Mã màu không được để trống' })
  @IsHexColor({ message: 'Mã màu phải là mã hex hợp lệ' })
  color: string;
}
