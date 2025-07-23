import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const newTask = new this.taskModel({
      ...createTaskDto,
      user: userId,
    });
    return newTask.save();
  }

  async findAll(userId: string, filters: any = {}): Promise<Task[]> {
    const query: any = { user: userId };

    // Áp dụng các bộ lọc nếu có
    if (filters.completed !== undefined) {
      query.completed = filters.completed === 'true';
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.category) {
      query.category = new Types.ObjectId(filters.category);
    }

    if (filters.project) {
      query.project = new Types.ObjectId(filters.project);
    }

    // Lọc theo ngày đến hạn
    if (filters.dueDate) {
      const date = new Date(filters.dueDate);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      query.dueDate = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    return this.taskModel
      .find(query)
      .populate('category', 'name color')
      .populate('project', 'name')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel
      .findById(id)
      .populate('category', 'name color')
      .populate('project', 'name')
      .exec();

    if (!task) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập công việc này');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    // Kiểm tra quyền truy cập
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật công việc này');
    }

    // Cập nhật công việc
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, updateTaskDto, { new: true })
      .populate('category', 'name color')
      .populate('project', 'name')
      .exec();

    if (!updatedTask) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }
    
    return updatedTask;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Kiểm tra quyền truy cập
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa công việc này');
    }

    // Xóa công việc
    await this.taskModel.findByIdAndDelete(id).exec();
  }

  async toggleCompletion(id: string, userId: string): Promise<Task> {
    // Kiểm tra quyền truy cập
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật công việc này');
    }

    // Đảo ngược trạng thái hoàn thành
    task.completed = !task.completed;
    return task.save();
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Task> {
    // Kiểm tra quyền truy cập
    const task = await this.taskModel.findById(id);
    if (!task) {
      throw new NotFoundException(`Không tìm thấy công việc với ID: ${id}`);
    }

    if (task.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật công việc này');
    }

    // Cập nhật trạng thái Scrum
    task.status = status as any;
    return task.save();
  }

  async findTasksDueSoon(userId: string, hours: number = 24): Promise<Task[]> {
    const now = new Date();
    const futureTime = new Date();
    futureTime.setHours(futureTime.getHours() + hours);

    return this.taskModel.find({
      user: new Types.ObjectId(userId),
      completed: false,
      dueDate: {
        $gte: now,
        $lte: futureTime,
      },
    }).sort({ dueDate: 1 }).exec();
  }
}
