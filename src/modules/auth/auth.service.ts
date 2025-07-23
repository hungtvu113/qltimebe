import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng');
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const user = await this.usersService.create({
      email,
      password: hashedPassword,
      name,
    });

    // Tạo token JWT
    const userDoc = user as unknown as UserDocument;
    const token = this.generateToken(userDoc);

    return {
      user: {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
      },
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Tìm người dùng theo email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Thông tin đăng nhập không chính xác');
    }

    // Tạo token JWT
    const userDoc = user as unknown as UserDocument;
    const token = this.generateToken(userDoc);

    return {
      user: {
        id: userDoc._id,
        email: userDoc.email,
        name: userDoc.name,
      },
      token,
    };
  }

  async getMe(user: UserDocument) {
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
    };
  }

  private generateToken(user: UserDocument) {
    const payload: JwtPayload = { sub: user._id.toString(), email: user.email };
    return this.jwtService.sign(payload);
  }
}
