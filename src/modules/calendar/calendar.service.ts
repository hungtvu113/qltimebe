import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { TimeBlocksService } from '../time-blocks/time-blocks.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly timeBlocksService: TimeBlocksService,
  ) {}

  async getCalendarData(userId: string, start: string, end: string) {
    // Lấy tất cả công việc có ngày đến hạn trong khoảng thời gian
    const tasks = await this.tasksService.findAll(userId, {
      dueDate: { $gte: new Date(start), $lte: new Date(end) },
    });

    // Lấy tất cả khối thời gian trong khoảng thời gian
    const timeBlocks = await this.timeBlocksService.findAll(userId);
    
    // Lọc khối thời gian trong khoảng thời gian
    const filteredTimeBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= new Date(start) && blockDate <= new Date(end);
    });

    return {
      tasks,
      timeBlocks: filteredTimeBlocks,
    };
  }

  async getDayData(userId: string, date: string) {
    // Lấy tất cả công việc có ngày đến hạn trong ngày
    const tasks = await this.tasksService.findAll(userId, { dueDate: date });

    // Lấy tất cả khối thời gian trong ngày
    const timeBlocks = await this.timeBlocksService.findAll(userId, date);

    return {
      tasks,
      timeBlocks,
    };
  }

  async getWeekData(userId: string, date: string) {
    // Tính toán ngày bắt đầu và kết thúc của tuần
    const currentDate = new Date(date);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Chủ nhật là ngày đầu tuần
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Thứ 7 là ngày cuối tuần
    endOfWeek.setHours(23, 59, 59, 999);

    // Lấy dữ liệu lịch cho cả tuần
    return this.getCalendarData(userId, startOfWeek.toISOString(), endOfWeek.toISOString());
  }
}
