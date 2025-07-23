import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Category } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, userId: string): Promise<Category> {
    const newCategory = new this.categoryModel({
      ...createCategoryDto,
      user: userId,
    });
    return newCategory.save();
  }

  async findAll(userId: string): Promise<Category[]> {
    return this.categoryModel
      .find({ user: userId })
      .sort({ name: 1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<Category> {
    // Kiểm tra ID có hợp lệ không
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID danh mục không hợp lệ: ${id}`);
    }

    const category = await this.categoryModel.findById(id).exec();

    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (category.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập danh mục này');
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, userId: string): Promise<Category> {
    // Kiểm tra ID có hợp lệ không
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID danh mục không hợp lệ: ${id}`);
    }

    // Kiểm tra quyền truy cập
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }

    if (category.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật danh mục này');
    }

    // Cập nhật danh mục
    const updatedCategory = await this.categoryModel
      .findByIdAndUpdate(id, updateCategoryDto, { new: true })
      .exec();

    if (!updatedCategory) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }

    return updatedCategory;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Kiểm tra ID có hợp lệ không
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID danh mục không hợp lệ: ${id}`);
    }

    // Kiểm tra quyền truy cập
    const category = await this.categoryModel.findById(id);
    if (!category) {
      throw new NotFoundException(`Không tìm thấy danh mục với ID: ${id}`);
    }

    if (category.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa danh mục này');
    }

    // Xóa danh mục
    await this.categoryModel.findByIdAndDelete(id).exec();
  }
}
