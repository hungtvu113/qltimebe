import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note } from './schemas/note.schema';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private noteModel: Model<Note>,
  ) {}

  async create(createNoteDto: CreateNoteDto, userId: string): Promise<Note> {
    const newNote = new this.noteModel({
      ...createNoteDto,
      user: userId,
    });
    return newNote.save();
  }

  async findAll(userId: string): Promise<Note[]> {
    return this.noteModel
      .find({ user: userId })
      .sort({ updatedAt: -1 })
      .exec();
  }

  async findById(id: string, userId: string): Promise<Note> {
    const note = await this.noteModel.findById(id).exec();

    if (!note) {
      throw new NotFoundException(`Không tìm thấy ghi chú với ID: ${id}`);
    }

    // Kiểm tra quyền truy cập
    if (note.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền truy cập ghi chú này');
    }

    return note;
  }

  async update(id: string, updateNoteDto: UpdateNoteDto, userId: string): Promise<Note> {
    // Kiểm tra quyền truy cập
    const note = await this.noteModel.findById(id);
    if (!note) {
      throw new NotFoundException(`Không tìm thấy ghi chú với ID: ${id}`);
    }

    if (note.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật ghi chú này');
    }

    // Cập nhật ghi chú
    const updatedNote = await this.noteModel
      .findByIdAndUpdate(id, updateNoteDto, { new: true })
      .exec();

    if (!updatedNote) {
      throw new NotFoundException(`Không tìm thấy ghi chú với ID: ${id}`);
    }

    return updatedNote;
  }

  async remove(id: string, userId: string): Promise<void> {
    // Kiểm tra quyền truy cập
    const note = await this.noteModel.findById(id);
    if (!note) {
      throw new NotFoundException(`Không tìm thấy ghi chú với ID: ${id}`);
    }

    if (note.user.toString() !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa ghi chú này');
    }

    // Xóa ghi chú
    await this.noteModel.findByIdAndDelete(id).exec();
  }
}
