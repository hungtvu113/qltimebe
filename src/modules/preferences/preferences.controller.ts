import { Controller, Get, Put, Patch, Body, UseGuards } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UpdatePreferenceDto } from './dto/update-preference.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Tùy chọn người dùng')
@Controller('api/preferences')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PreferencesController {
  constructor(private readonly preferencesService: PreferencesService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy tùy chọn người dùng' })
  @ApiResponse({ status: 200, description: 'Thành công' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  getPreferences(@GetUser() user: UserDocument) {
    return this.preferencesService.getPreferences(user._id.toString());
  }

  @Put()
  @ApiOperation({ summary: 'Cập nhật tùy chọn người dùng (PUT)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  updatePreferences(
    @GetUser() user: UserDocument,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ) {
    return this.preferencesService.updatePreferences(user._id.toString(), updatePreferenceDto);
  }

  @Patch()
  @ApiOperation({ summary: 'Cập nhật tùy chọn người dùng (PATCH)' })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 400, description: 'Dữ liệu không hợp lệ' })
  @ApiResponse({ status: 401, description: 'Chưa xác thực' })
  patchPreferences(
    @GetUser() user: UserDocument,
    @Body() updatePreferenceDto: UpdatePreferenceDto,
  ) {
    return this.preferencesService.updatePreferences(user._id.toString(), updatePreferenceDto);
  }
}
