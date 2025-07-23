import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ThemeType, CalendarViewType, StartOfWeekType } from '../schemas/preference.schema';

export class UpdatePreferenceDto {
  @ApiPropertyOptional({
    description: 'Chủ đề',
    enum: ['light', 'dark', 'system'],
    example: 'dark',
  })
  @IsOptional()
  @IsEnum(['light', 'dark', 'system'], { message: 'Chủ đề không hợp lệ' })
  theme?: ThemeType;

  @ApiPropertyOptional({
    description: 'Ngôn ngữ',
    example: 'en',
  })
  @IsOptional()
  @IsString({ message: 'Ngôn ngữ phải là chuỗi' })
  language?: string;

  @ApiPropertyOptional({
    description: 'Bật/tắt thông báo',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái thông báo phải là boolean' })
  notifications?: boolean;

  @ApiPropertyOptional({
    description: 'Chế độ xem lịch mặc định',
    enum: ['day', 'week', 'month'],
    example: 'month',
  })
  @IsOptional()
  @IsEnum(['day', 'week', 'month'], { message: 'Chế độ xem lịch không hợp lệ' })
  calendarView?: CalendarViewType;

  @ApiPropertyOptional({
    description: 'Ngày bắt đầu tuần',
    enum: [0, 1, 6],
    example: 0,
  })
  @IsOptional()
  @IsEnum([0, 1, 6], { message: 'Ngày bắt đầu tuần không hợp lệ' })
  startOfWeek?: StartOfWeekType;

  @ApiPropertyOptional({
    description: 'Hiển thị công việc đã hoàn thành',
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Trạng thái hiển thị công việc đã hoàn thành phải là boolean' })
  showCompletedTasks?: boolean;
}
