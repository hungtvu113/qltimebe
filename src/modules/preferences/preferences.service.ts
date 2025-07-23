import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Preference, PreferenceDocument } from './schemas/preference.schema';
import { UpdatePreferenceDto } from './dto/update-preference.dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectModel(Preference.name) private preferenceModel: Model<PreferenceDocument>,
  ) {}

  async getPreferences(userId: string): Promise<PreferenceDocument> {
    // Tìm tùy chọn của người dùng hoặc tạo mới nếu chưa có
    let preferences = await this.preferenceModel.findOne({ user: userId }).exec();
    
    if (!preferences) {
      // Tạo tùy chọn mặc định
      return this.createDefaultPreferences(userId);
    }
    
    return preferences;
  }

  async updatePreferences(userId: string, updatePreferenceDto: UpdatePreferenceDto): Promise<PreferenceDocument> {
    const preferences = await this.preferenceModel.findOne({ user: userId }).exec();
    
    if (!preferences) {
      // Tạo tùy chọn mặc định và cập nhật
      const defaultPreferences = await this.createDefaultPreferences(userId);
      
      // Cập nhật với dữ liệu mới
      Object.assign(defaultPreferences, updatePreferenceDto);
      return defaultPreferences.save();
    }
    
    // Cập nhật tùy chọn hiện có
    Object.assign(preferences, updatePreferenceDto);
    return preferences.save();
  }

  private async createDefaultPreferences(userId: string): Promise<PreferenceDocument> {
    const defaultPreferences = new this.preferenceModel({
      user: userId,
      theme: 'system',
      language: 'vi',
      notifications: true,
      calendarView: 'week',
      startOfWeek: 1, // Monday
      showCompletedTasks: true,
    });
    
    const savedPreferences = await defaultPreferences.save();
    if (!savedPreferences) {
      throw new NotFoundException(`Không thể tạo tùy chọn mặc định cho người dùng: ${userId}`);
    }
    
    return savedPreferences;
  }
}
