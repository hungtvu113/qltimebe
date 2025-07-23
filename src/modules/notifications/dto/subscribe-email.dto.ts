import { IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SubscribeEmailDto {
  @ApiProperty({
    description: 'Địa chỉ email để nhận thông báo',
    example: 'user@example.com',
  })
  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  email: string;

  @ApiProperty({
    description: 'Nhận thông báo công việc sắp hết hạn',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'taskReminders phải là boolean' })
  taskReminders?: boolean;

  @ApiProperty({
    description: 'Nhận tóm tắt hàng ngày',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'dailySummary phải là boolean' })
  dailySummary?: boolean;

  @ApiProperty({
    description: 'Nhận báo cáo hàng tuần',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'weeklyReport phải là boolean' })
  weeklyReport?: boolean;

  @ApiProperty({
    description: 'Số giờ trước khi nhắc nhở (1-168 giờ)',
    example: 24,
    default: 24,
  })
  @IsOptional()
  @IsNumber({}, { message: 'reminderHours phải là số' })
  @Min(1, { message: 'reminderHours phải ít nhất 1 giờ' })
  @Max(168, { message: 'reminderHours không được quá 168 giờ (7 ngày)' })
  reminderHours?: number;
}

export class UpdateEmailSubscriptionDto {
  @ApiProperty({
    description: 'Trạng thái đăng ký',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là boolean' })
  isActive?: boolean;

  @ApiProperty({
    description: 'Nhận thông báo công việc sắp hết hạn',
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: 'taskReminders phải là boolean' })
  taskReminders?: boolean;

  @ApiProperty({
    description: 'Nhận tóm tắt hàng ngày',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'dailySummary phải là boolean' })
  dailySummary?: boolean;

  @ApiProperty({
    description: 'Nhận báo cáo hàng tuần',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'weeklyReport phải là boolean' })
  weeklyReport?: boolean;

  @ApiProperty({
    description: 'Số giờ trước khi nhắc nhở (1-168 giờ)',
    example: 24,
  })
  @IsOptional()
  @IsNumber({}, { message: 'reminderHours phải là số' })
  @Min(1, { message: 'reminderHours phải ít nhất 1 giờ' })
  @Max(168, { message: 'reminderHours không được quá 168 giờ (7 ngày)' })
  reminderHours?: number;
}
