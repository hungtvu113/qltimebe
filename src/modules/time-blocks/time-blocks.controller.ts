import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Patch } from '@nestjs/common';
import { TimeBlocksService } from './time-blocks.service';
import { CreateTimeBlockDto } from './dto/create-time-block.dto';
import { UpdateTimeBlockDto } from './dto/update-time-block.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Khối thời gian')
@Controller('api/time-blocks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TimeBlocksController {
  constructor(private readonly timeBlocksService: TimeBlocksService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo khối thời gian mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async create(@Body() createTimeBlockDto: CreateTimeBlockDto, @GetUser() user: UserDocument) {
    return await this.timeBlocksService.create(createTimeBlockDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách khối thời gian' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiQuery({ name: 'date', required: false, description: 'Lọc theo ngày (YYYY-MM-DD)' })
  async findAll(
    @GetUser() user: UserDocument,
    @Query('date') date?: string,
  ) {
    return await this.timeBlocksService.findAll(user._id.toString(), date);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Lấy khối thời gian theo ngày' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  async findByDate(@Param('date') date: string, @GetUser() user: UserDocument) {
    return await this.timeBlocksService.findAll(user._id.toString(), date);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một khối thời gian' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối thời gian' })
  async findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
    return await this.timeBlocksService.findById(id, user._id.toString());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật khối thời gian' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối thời gian' })
  async update(
    @Param('id') id: string,
    @Body() updateTimeBlockDto: UpdateTimeBlockDto,
    @GetUser() user: UserDocument,
  ) {
    return await this.timeBlocksService.update(id, updateTimeBlockDto, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa khối thời gian' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối thời gian' })
  async remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    await this.timeBlocksService.remove(id, user._id.toString());
    return { success: true };
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Đánh dấu khối thời gian hoàn thành/chưa hoàn thành' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy khối thời gian' })
  async toggleComplete(@Param('id') id: string, @GetUser() user: UserDocument) {
    return await this.timeBlocksService.toggleCompletion(id, user._id.toString());
  }
}
