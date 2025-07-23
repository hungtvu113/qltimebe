import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageDto {
  @ApiProperty({ description: 'Vai trò của tin nhắn', enum: ['user', 'assistant'] })
  @IsString()
  @IsNotEmpty()
  role: 'user' | 'assistant';

  @ApiProperty({ description: 'Nội dung tin nhắn' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ description: 'Thời gian gửi tin nhắn', required: false })
  @IsOptional()
  timestamp?: Date;
}

export class ChatRequestDto {
  @ApiProperty({ description: 'Tin nhắn từ người dùng' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ 
    description: 'Lịch sử chat (tùy chọn)', 
    type: [ChatMessageDto],
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  chatHistory?: ChatMessageDto[];

  @ApiProperty({ description: 'ID phiên chat (tùy chọn)', required: false })
  @IsOptional()
  @IsString()
  sessionId?: string;
}

export class TaskSuggestionDto {
  @ApiProperty({ description: 'Tiêu đề công việc' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Mô tả công việc', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class ChatResponseDto {
  @ApiProperty({ description: 'Phản hồi từ AI' })
  response: string;

  @ApiProperty({ description: 'ID phiên chat' })
  sessionId: string;

  @ApiProperty({ description: 'Thời gian phản hồi' })
  timestamp: Date;
}
