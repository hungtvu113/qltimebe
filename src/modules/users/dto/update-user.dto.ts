import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Tên người dùng',
    example: 'Nguyễn Văn A',
  })
  @IsOptional()
  @IsString({ message: 'Tên phải là chuỗi' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Địa chỉ email',
    example: 'example@gmail.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email?: string;

  @ApiPropertyOptional({
    description: 'URL hình đại diện',
    example: 'https://example.com/avatar.jpg',
  })
  @IsOptional()
  @IsString({ message: 'Avatar phải là chuỗi' })
  avatar?: string;
}
