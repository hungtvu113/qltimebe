import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Get, 
  Query, 
  Delete,
  Param 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiQuery 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { AIService } from './ai.service';
import { 
  ChatRequestDto, 
  ChatResponseDto, 
  TaskSuggestionDto 
} from './dto/chat.dto';

@ApiTags('AI')
@Controller('api/ai')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat với AI' })
  @ApiResponse({ 
    status: 200, 
    description: 'Phản hồi từ AI',
    type: ChatResponseDto 
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async chat(
    @Body() chatRequest: ChatRequestDto,
    @GetUser() user: UserDocument
  ): Promise<ChatResponseDto> {
    return this.aiService.chat(user._id.toString(), chatRequest);
  }

  @Post('suggest-priority')
  @ApiOperation({ summary: 'Gợi ý độ ưu tiên cho công việc' })
  @ApiResponse({ 
    status: 200, 
    description: 'Độ ưu tiên được gợi ý',
    schema: {
      type: 'object',
      properties: {
        priority: {
          type: 'string',
          enum: ['high', 'medium', 'low']
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async suggestPriority(
    @Body() taskSuggestion: TaskSuggestionDto
  ): Promise<{ priority: 'high' | 'medium' | 'low' }> {
    const priority = await this.aiService.suggestPriority(taskSuggestion);
    return { priority };
  }

  @Post('suggest-due-date')
  @ApiOperation({ summary: 'Gợi ý ngày hoàn thành cho công việc' })
  @ApiResponse({ 
    status: 200, 
    description: 'Ngày hoàn thành được gợi ý',
    schema: {
      type: 'object',
      properties: {
        dueDate: {
          type: 'string',
          format: 'date',
          nullable: true
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async suggestDueDate(
    @Body() taskSuggestion: TaskSuggestionDto
  ): Promise<{ dueDate: string | null }> {
    const dueDate = await this.aiService.suggestDueDate(taskSuggestion);
    return { dueDate };
  }

  @Get('chat-history')
  @ApiOperation({ summary: 'Lấy lịch sử chat' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'ID phiên chat' })
  @ApiQuery({ name: 'limit', required: false, description: 'Số lượng tin nhắn tối đa' })
  @ApiResponse({ 
    status: 200, 
    description: 'Lịch sử chat',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          role: { type: 'string', enum: ['user', 'assistant'] },
          content: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          sessionId: { type: 'string' }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async getChatHistory(
    @GetUser() user: UserDocument,
    @Query('sessionId') sessionId?: string,
    @Query('limit') limit?: number
  ) {
    return this.aiService.getChatHistory(
      user._id.toString(),
      sessionId,
      limit ? parseInt(limit.toString()) : 50
    );
  }

  @Delete('chat-history')
  @ApiOperation({ summary: 'Xóa lịch sử chat' })
  @ApiQuery({ name: 'sessionId', required: false, description: 'ID phiên chat (nếu không có sẽ xóa tất cả)' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async clearChatHistory(
    @GetUser() user: UserDocument,
    @Query('sessionId') sessionId?: string
  ): Promise<{ message: string }> {
    await this.aiService.clearChatHistory(user._id.toString(), sessionId);
    return {
      message: sessionId
        ? 'Đã xóa lịch sử chat của phiên này'
        : 'Đã xóa toàn bộ lịch sử chat'
    };
  }
}
