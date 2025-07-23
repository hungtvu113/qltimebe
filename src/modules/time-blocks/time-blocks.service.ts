import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimeBlock } from './schemas/time-block.schema';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';

@Injectable()
export class TimeBlocksService {
  constructor(
    @InjectModel(TimeBlock.name) private timeBlockModel: Model<TimeBlock>,
  ) {}

  async create(createTimeBlockDto: CreateTimeBlockDto, userId: string): Promise<TimeBlock> {
    // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
    if (createTimeBlockDto.startTime >= createTimeBlockDto.endTime) {
      throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
    }

    const newTimeBlock = new this.timeBlockModel({
      ...createTimeBlockDto,
      user: userId,
    });
    return newTimeBlock.save();
  }

  async findAll(userId: string, date?: string): Promise<TimeBlock[]> {
    const query: any = { user: userId };

    // Lọc theo ngày nếu có
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      
      query.startTime = {
        $gte: startOfDay,
        $lte: endOfDay,
      };
    }

    return this.timeBlockModel
      .find(query)
      .sort({ startTime: 1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<TimeBlock> {
    const timeBlock = await this.timeBlockModel
      .findById(id)
      .exec();

    if (!timeBlock) {
      throw new NotFoundException(`Không tìm thấy khối thời gian với ID: ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (timeBlock.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập khối thời gian này');
    }

    return timeBlock;
  }

  async update(id: string, updateTimeBlockDto: UpdateTimeBlockDto, userId: string): Promise<TimeBlock> {
    // Kiểm tra quyền truy cập
    const timeBlock = await this.timeBlockModel.findById(id);
    if (!timeBlock) {
      throw new NotFoundException(`Không tìm thấy khối thời gian với ID: ${id}`);
    }

    if (timeBlock.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật khối thời gian này');
    }

    // Kiểm tra thời gian bắt đầu và kết thúc nếu cả hai được cung cấp
    if (updateTimeBlockDto.startTime && updateTimeBlockDto.endTime) {
      if (updateTimeBlockDto.startTime >= updateTimeBlockDto.endTime) {
        throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (updateTimeBlockDto.startTime && !updateTimeBlockDto.endTime) {
      // Nếu chỉ cập nhật thời gian bắt đầu, kiểm tra với thời gian kết thúc hiện tại
      if (updateTimeBlockDto.startTime >= timeBlock.endTime) {
        throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    } else if (!updateTimeBlockDto.startTime && updateTimeBlockDto.endTime) {
      // Nếu chỉ cập nhật thời gian kết thúc, kiểm tra với thời gian bắt đầu hiện tại
      if (timeBlock.startTime >= updateTimeBlockDto.endTime) {
        throw new BadRequestException('Thời gian bắt đầu phải trước thời gian kết thúc');
      }
    }

    // Cập nhật khối thời gian
    const updatedTimeBlock = await this.timeBlockModel
      .findByIdAndUpdate(id, updateTimeBlockDto, { new: true })
      .exec();

    if (!updatedTimeBlock) {
      throw new NotFoundException(`Không tìm thấy khối thời gian với ID: ${id}`);
    }

    return updatedTimeBlock;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Kiểm tra quyền truy cập
    const timeBlock = await this.timeBlockModel.findById(id);
    if (!timeBlock) {
      throw new NotFoundException(`Không tìm thấy khối thời gian với ID: ${id}`);
    }

    if (timeBlock.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa khối thời gian này');
    }

    // Xóa khối thời gian
    await this.timeBlockModel.findByIdAndDelete(id).exec();
  }

  async toggleCompletion(id: string, userId: string): Promise<TimeBlock> {
    // Kiểm tra quyền truy cập
    const timeBlock = await this.timeBlockModel.findById(id);
    if (!timeBlock) {
      throw new NotFoundException(`Không tìm thấy khối thời gian với ID: ${id}`);
    }

    if (timeBlock.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật khối thời gian này');
    }

    // Đảo ngược trạng thái hoàn thành
    timeBlock.isCompleted = !timeBlock.isCompleted;
    return timeBlock.save();
  }
}
