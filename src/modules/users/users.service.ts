import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDto);
    return newUser.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').exec();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Xử lý đặc biệt cho avatar: nếu avatar là undefined hoặc empty string, xóa field avatar
    const updateData: any = { ...updateUserDto };

    if ('avatar' in updateUserDto) {
      if (!updateUserDto.avatar || updateUserDto.avatar.trim() === '') {
        // Xóa field avatar khỏi document
        updateData.$unset = { avatar: 1 };
        delete updateData.avatar;
      }
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .select('-password')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }

    return updatedUser;
  }

  async updatePassword(id: string, hashedPassword: string): Promise<void> {
    const result = await this.userModel
      .updateOne({ _id: id }, { password: hashedPassword })
      .exec();
    
    if (result.matchedCount === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();
    
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Không tìm thấy người dùng với ID: ${id}`);
    }
  }
}
