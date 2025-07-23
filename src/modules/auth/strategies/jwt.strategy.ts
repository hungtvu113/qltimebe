import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET') || 'qltime_secret_key',
    });
  }

  async validate(payload: JwtPayload) {
    const { sub } = payload;
    const user = await this.usersService.findById(sub);

    if (!user) {
      throw new UnauthorizedException('Người dùng không tồn tại hoặc token không hợp lệ');
    }

    return user;
  }
}
