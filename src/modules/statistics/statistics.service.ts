import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { TimeBlocksService } from '../time-blocks/time-blocks.service';

@Injectable()
export class StatisticsService {
  constructor(
    private readonly tasksService: TasksService,
    private readonly timeBlocksService: TimeBlocksService,
  ) {}

  async getTasksStatistics(userId: string, startDate?: string, endDate?: string) {
    // Xác định khoảng thời gian mặc định nếu không được cung cấp
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // 30 ngày trước
    
    const end = endDate 
      ? new Date(endDate) 
      : new Date(); // Ngày hiện tại
    
    // Lấy tất cả công việc trong khoảng thời gian (đã có populate category)
    const tasks = await this.tasksService.findAll(userId, {
      createdAt: { $gte: start, $lte: end },
    });

    // Tính toán thống kê
    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.filter(task => !task.completed).length;
    const overdue = tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return new Date(task.dueDate) < new Date();
    }).length;

    // Thống kê theo mức độ ưu tiên
    const byPriority = {
      low: tasks.filter(task => task.priority === 'low').length,
      medium: tasks.filter(task => task.priority === 'medium').length,
      high: tasks.filter(task => task.priority === 'high').length,
    };

    // Thống kê theo trạng thái
    const byStatus = {
      backlog: tasks.filter(task => task.status === 'backlog').length,
      todo: tasks.filter(task => task.status === 'todo').length,
      doing: tasks.filter(task => task.status === 'doing').length,
      done: tasks.filter(task => task.status === 'done').length,
    };

    // Thống kê theo danh mục
    const byCategory = {};
    tasks.forEach(task => {
      if (task.category) {
        // Nếu category được populate, sử dụng name, nếu không thì sử dụng ID
        const categoryName = (task.category as any).name || task.category.toString();
        byCategory[categoryName] = (byCategory[categoryName] || 0) + 1;
      } else {
        byCategory['Không có danh mục'] = (byCategory['Không có danh mục'] || 0) + 1;
      }
    });

    return {
      total: tasks.length,
      completed,
      pending,
      overdue,
      byPriority,
      byStatus,
      byCategory,
    };
  }

  async getTimeBlocksStatistics(userId: string, startDate?: string, endDate?: string) {
    // Xác định khoảng thời gian mặc định nếu không được cung cấp
    const start = startDate 
      ? new Date(startDate) 
      : new Date(new Date().setDate(new Date().getDate() - 30)); // 30 ngày trước
    
    const end = endDate 
      ? new Date(endDate) 
      : new Date(); // Ngày hiện tại
    
    // Lấy tất cả khối thời gian trong khoảng thời gian
    const timeBlocks = await this.timeBlocksService.findAll(userId);
    
    // Lọc khối thời gian trong khoảng thời gian
    const filteredTimeBlocks = timeBlocks.filter(block => {
      const blockDate = new Date(block.startTime);
      return blockDate >= start && blockDate <= end;
    });

    // Tính tổng số giờ
    let totalHours = 0;
    let completedHours = 0;

    filteredTimeBlocks.forEach(block => {
      const startTime = new Date(block.startTime);
      const endTime = new Date(block.endTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      totalHours += durationHours;
      
      if (block.isCompleted) {
        completedHours += durationHours;
      }
    });

    // Thống kê theo ngày
    const byDay = {};
    filteredTimeBlocks.forEach(block => {
      const date = new Date(block.startTime).toISOString().split('T')[0];
      
      if (!byDay[date]) {
        byDay[date] = {
          total: 0,
          completed: 0,
        };
      }
      
      const startTime = new Date(block.startTime);
      const endTime = new Date(block.endTime);
      const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
      
      byDay[date].total += durationHours;
      
      if (block.isCompleted) {
        byDay[date].completed += durationHours;
      }
    });

    return {
      totalHours: parseFloat(totalHours.toFixed(2)),
      completedHours: parseFloat(completedHours.toFixed(2)),
      completionRate: totalHours > 0 ? parseFloat((completedHours / totalHours * 100).toFixed(2)) : 0,
      byDay,
    };
  }

  async getProductivityStatistics(userId: string, startDate?: string, endDate?: string) {
    // Lấy thống kê về công việc và khối thời gian
    const tasksStats = await this.getTasksStatistics(userId, startDate, endDate);
    const timeBlocksStats = await this.getTimeBlocksStatistics(userId, startDate, endDate);

    // Tính điểm năng suất (đơn giản hóa)
    const taskCompletionRate = tasksStats.total > 0 
      ? (tasksStats.completed / tasksStats.total) * 100 
      : 0;
    
    const timeBlockCompletionRate = timeBlocksStats.totalHours > 0 
      ? (timeBlocksStats.completedHours / timeBlocksStats.totalHours) * 100 
      : 0;
    
    // Trọng số: 60% cho công việc hoàn thành, 40% cho khối thời gian hoàn thành
    const productivityScore = (taskCompletionRate * 0.6) + (timeBlockCompletionRate * 0.4);

    // Tính điểm năng suất theo ngày
    const dailyScores = {};
    
    // Lấy tất cả các ngày từ cả hai thống kê
    const allDays = new Set([
      ...Object.keys(timeBlocksStats.byDay),
    ]);
    
    allDays.forEach(date => {
      const timeBlockData = timeBlocksStats.byDay[date] || { total: 0, completed: 0 };
      const timeBlockScore = timeBlockData.total > 0 
        ? (timeBlockData.completed / timeBlockData.total) * 100 
        : 0;
      
      // Đơn giản hóa: chỉ dựa vào khối thời gian cho điểm năng suất hàng ngày
      dailyScores[date] = parseFloat(timeBlockScore.toFixed(2));
    });

    return {
      productivityScore: parseFloat(productivityScore.toFixed(2)),
      taskCompletionRate: parseFloat(taskCompletionRate.toFixed(2)),
      timeBlockCompletionRate: parseFloat(timeBlockCompletionRate.toFixed(2)),
      dailyScores,
    };
  }
}
