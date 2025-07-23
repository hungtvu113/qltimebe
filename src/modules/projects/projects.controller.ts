import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Dự án')
@Controller('api/projects')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo dự án mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  create(@Body() createProjectDto: CreateProjectDto, @GetUser() user: UserDocument) {
    return this.projectsService.create(createProjectDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách dự án' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  findAll(@GetUser() user: UserDocument) {
    return this.projectsService.findAll(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một dự án' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.projectsService.findById(id, user._id.toString());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật dự án' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: UserDocument,
  ) {
    return this.projectsService.update(id, updateProjectDto, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa dự án' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    this.projectsService.remove(id, user._id.toString());
    return { success: true };
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Lấy danh sách công việc trong dự án' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy dự án' })
  async getProjectTasks(@Param('id') id: string, @GetUser() user: UserDocument) {
    // Kiểm tra dự án tồn tại và thuộc về người dùng
    await this.projectsService.findById(id, user._id.toString());
    
    // Gọi service tasks để lấy danh sách công việc theo dự án
    // Lưu ý: Cần inject TasksService hoặc tạo một phương thức riêng trong ProjectsService
    // Đây là mẫu trả về tạm thời
    return { 
      message: 'Chức năng này cần được kết nối với TasksService',
      projectId: id
    };
  }
}
