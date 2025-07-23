import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Ghi chú')
@Controller('api/notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo ghi chú mới' })
  @ApiResponse({ status: 201, description: 'Tạo thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  create(@Body() createNoteDto: CreateNoteDto, @GetUser() user: UserDocument) {
    return this.notesService.create(createNoteDto, user._id.toString());
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách ghi chú' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  findAll(@GetUser() user: UserDocument) {
    return this.notesService.findAll(user._id.toString());
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết một ghi chú' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú' })
  findOne(@Param('id') id: string, @GetUser() user: UserDocument) {
    return this.notesService.findById(id, user._id.toString());
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật ghi chú' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú' })
  update(
    @Param('id') id: string,
    @Body() updateNoteDto: UpdateNoteDto,
    @GetUser() user: UserDocument,
  ) {
    return this.notesService.update(id, updateNoteDto, user._id.toString());
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa ghi chú' })
  @ApiResponse({ status: 200, description: 'Xóa thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  @ApiResponse({ status: 403, description: 'Không có quyền truy cập' })
  @ApiResponse({ status: 404, description: 'Không tìm thấy ghi chú' })
  remove(@Param('id') id: string, @GetUser() user: UserDocument) {
    this.notesService.remove(id, user._id.toString());
    return { success: true };
  }
}
