import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Công việc')
@Controller('api/tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo công việc mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: UserDocument) {
    return this.tasksService.create(createTaskDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách công việc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'completed', required: false, type: Boolean })
  @ApiQuery({ name: 'priority', required: false, enum: ['low', 'medium', 'high'] })
  @ApiQuery({ name: 'dueDate', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['backlog', 'todo', 'doing', 'done'] })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(
    @GetUser() user: UserDocument,
    @Query() query: any,
  ) {
    // Map projectId to project for service compatibility
    if (query.projectId) {
      query.project = query.projectId;
      delete query.projectId;
    }
    return this.tasksService.findAll(user._id.toString(), query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một công việc' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.tasksService.findById(id, user._id.toString());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật công việc' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @GetUser() user: UserDocument,
  ) {
    return await this.tasksService.update(id, updateTaskDto, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa công việc' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  async remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    await this.tasksService.remove(id, user._id.toString());
    return { success: true };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Đánh dấu công việc hoàn thành/chưa hoàn thành' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  async toggleComplete(@Param('id') id: string, @GetUser() user: UserDocument) {
    return await this.tasksService.toggleCompletion(id, user._id.toString());
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Cập nhật trạng thái Scrum của công việc' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy công việc' })
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @GetUser() user: UserDocument,
  ) {
    return this.tasksService.updateStatus(id, status, user._id.toString());
  }
}
