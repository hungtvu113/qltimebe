import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { genkit } from 'genkit';
import { googleAI, gemini25FlashPreview0417 } from '@genkit-ai/googleai';
import { ChatHistory, ChatHistoryDocument } from './schemas/chat-history.schema';
import { ChatRequestDto, ChatMessageDto, TaskSuggestionDto } from './dto/chat.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private ai: any;

  constructor(
    @InjectModel(ChatHistory.name)
    private chatHistoryModel: Model<ChatHistoryDocument>,
    private configService: ConfigService,
  ) {
    this.initializeAI();
  }

  private initializeAI() {
    try {
      const apiKey = this.configService.get<string>('GEMINI_API_KEY');
      if (!apiKey) {
        this.logger.warn('GEMINI_API_KEY not found. AI features will be limited.');
        return;
      }

      this.ai = genkit({
        plugins: [googleAI()],
        model: gemini25FlashPreview0417,
      });

      this.logger.log('AI service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize AI service:', error);
    }
  }

  async chat(userId: string, chatRequest: ChatRequestDto): Promise<any> {
    try {
      if (!this.ai) {
        throw new Error('AI service not available');
      }

      const sessionId = chatRequest.sessionId || uuidv4();

      // Lưu tin nhắn người dùng
      await this.saveChatMessage(userId, 'user', chatRequest.message, sessionId);

      // Tạo context từ lịch sử chat
      const chatHistory = chatRequest.chatHistory || [];
      const historyContext = chatHistory.length > 0 
        ? chatHistory.map(msg => `${msg.role === 'user' ? 'Người dùng' : 'AI'}: ${msg.content}`).join('\n')
        : '';

      const prompt = `
Bạn là Dr.AITime, một trợ lý AI thông minh chuyên về quản lý thời gian và công việc.

${historyContext ? `Lịch sử cuộc trò chuyện:\n${historyContext}\n` : ''}

Người dùng: ${chatRequest.message}

Hãy trả lời một cách thân thiện, hữu ích và chuyên nghiệp. Tập trung vào:
- Quản lý thời gian
- Tổ chức công việc
- Tăng năng suất
- Lời khuyên thực tế

Trả lời bằng tiếng Việt.`;

      const { text } = await this.ai.generate(prompt);

      // Lưu phản hồi AI
      await this.saveChatMessage(userId, 'assistant', text, sessionId);

      return {
        response: text,
        sessionId,
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error('Error in chat:', error);
      throw new Error('Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.');
    }
  }

  async suggestPriority(taskSuggestion: TaskSuggestionDto): Promise<'high' | 'medium' | 'low'> {
    try {
      if (!this.ai) {
        return this.fallbackSuggestPriority(taskSuggestion);
      }

      const prompt = `
Phân tích công việc sau và đề xuất độ ưu tiên (high/medium/low):

Tiêu đề: ${taskSuggestion.title}
Mô tả: ${taskSuggestion.description || 'Không có mô tả'}

Hãy trả về chỉ một từ: "high", "medium", hoặc "low" dựa trên:
- Tính khẩn cấp của công việc
- Tầm quan trọng 
- Deadline ngầm định
- Từ khóa chỉ độ ưu tiên

Chỉ trả về một từ, không giải thích.`;

      const { text } = await this.ai.generate(prompt);
      const response = text.toLowerCase().trim();
      
      if (['high', 'medium', 'low'].includes(response)) {
        return response as 'high' | 'medium' | 'low';
      }
      
      return 'medium';
    } catch (error) {
      this.logger.error('Error suggesting priority:', error);
      return this.fallbackSuggestPriority(taskSuggestion);
    }
  }

  async suggestDueDate(taskSuggestion: TaskSuggestionDto): Promise<string | null> {
    try {
      if (!this.ai) {
        return this.fallbackSuggestDueDate(taskSuggestion);
      }

      const today = new Date();
      const prompt = `
Phân tích công việc sau và đề xuất số ngày cần để hoàn thành:

Tiêu đề: ${taskSuggestion.title}
Mô tả: ${taskSuggestion.description || 'Không có mô tả'}
Ngày hiện tại: ${today.toLocaleDateString('vi-VN')}

Hãy trả về chỉ một số nguyên (1-365) đại diện cho số ngày cần để hoàn thành công việc này.
Xem xét:
- Độ phức tạp của công việc
- Thời gian thông thường cần thiết
- Từ khóa về thời gian (gấp, khẩn, tuần này, tháng này, etc.)

Chỉ trả về số nguyên, không giải thích.`;

      const { text } = await this.ai.generate(prompt);
      const daysToAdd = parseInt(text.trim());
      
      if (isNaN(daysToAdd) || daysToAdd < 1 || daysToAdd > 365) {
        return this.fallbackSuggestDueDate(taskSuggestion);
      }
      
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      this.logger.error('Error suggesting due date:', error);
      return this.fallbackSuggestDueDate(taskSuggestion);
    }
  }

  async getChatHistory(userId: string, sessionId?: string, limit: number = 50): Promise<ChatHistory[]> {
    const query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    return this.chatHistoryModel
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async clearChatHistory(userId: string, sessionId?: string): Promise<void> {
    const query: any = { userId };
    if (sessionId) {
      query.sessionId = sessionId;
    }

    await this.chatHistoryModel.deleteMany(query).exec();
  }

  private async saveChatMessage(
    userId: string, 
    role: 'user' | 'assistant', 
    content: string, 
    sessionId: string
  ): Promise<void> {
    try {
      const chatMessage = new this.chatHistoryModel({
        userId,
        role,
        content,
        sessionId,
        timestamp: new Date(),
      });

      await chatMessage.save();
    } catch (error) {
      this.logger.error('Error saving chat message:', error);
    }
  }

  private fallbackSuggestPriority(taskSuggestion: TaskSuggestionDto): 'high' | 'medium' | 'low' {
    const title = taskSuggestion.title.toLowerCase();
    const description = taskSuggestion.description?.toLowerCase() || '';
    
    const highPriorityKeywords = ['gấp', 'khẩn', 'ngay', 'quan trọng', 'deadline', 'hạn chót'];
    const lowPriorityKeywords = ['nhẹ nhàng', 'khi rảnh', 'không gấp', 'sau này', 'phụ'];
    
    for (const keyword of highPriorityKeywords) {
      if (title.includes(keyword) || description.includes(keyword)) {
        return 'high';
      }
    }
    
    for (const keyword of lowPriorityKeywords) {
      if (title.includes(keyword) || description.includes(keyword)) {
        return 'low';
      }
    }
    
    return 'medium';
  }

  private fallbackSuggestDueDate(taskSuggestion: TaskSuggestionDto): string | null {
    try {
      const title = taskSuggestion.title.toLowerCase();
      const description = taskSuggestion.description?.toLowerCase() || '';
      
      const today = new Date();
      let daysToAdd = 7;
      
      if (title.includes('gấp') || title.includes('khẩn') || description.includes('gấp')) {
        daysToAdd = 1;
      } else if (title.includes('tuần này') || description.includes('tuần này')) {
        daysToAdd = 5;
      } else if (title.includes('tháng') || description.includes('tháng')) {
        daysToAdd = 30;
      }
      
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + daysToAdd);
      return dueDate.toISOString().split('T')[0];
    } catch (error) {
      this.logger.error('Error in fallback due date suggestion:', error);
      return null;
    }
  }
}
