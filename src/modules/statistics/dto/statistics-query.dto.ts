import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class StatisticsQueryDto {
  @ApiPropertyOptional({
    description: 'Ngày bắt đầu',
    example: '2025-06-01',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày bắt đầu phải là chuỗi ngày hợp lệ' })
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Ngày kết thúc',
    example: '2025-06-30',
  })
  @IsOptional()
  @IsDateString({}, { message: 'Ngày kết thúc phải là chuỗi ngày hợp lệ' })
  endDate?: string;
}
