import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project } from './schemas/project.schema';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<Project>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string): Promise<Project> {
    const newProject = new this.projectModel({
      ...createProjectDto,
      user: userId,
    });
    return newProject.save();
  }

  async findAll(userId: string): Promise<Project[]> {
    return this.projectModel
      .find({ user: userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findById(id).exec();

    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (project.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập dự án này');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<Project> {
    // Kiểm tra quyền truy cập
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${id}`);
    }

    if (project.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật dự án này');
    }

    // Cập nhật dự án
    const updatedProject = await this.projectModel
      .findByIdAndUpdate(id, updateProjectDto, { new: true })
      .exec();

    if (!updatedProject) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${id}`);
    }

    return updatedProject;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Kiểm tra quyền truy cập
    const project = await this.projectModel.findById(id);
    if (!project) {
      throw new NotFoundException(`Không tìm thấy dự án với ID: ${id}`);
    }

    if (project.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa dự án này');
    }

    // Xóa dự án
    await this.projectModel.findByIdAndDelete(id).exec();
  }
}
