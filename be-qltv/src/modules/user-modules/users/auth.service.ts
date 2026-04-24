import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { EmailService } from 'src/common/services/email.service';
import { JwtPayload } from 'src/common/types/jwt.type';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  async validateUser(username: string, password: string) {
    let user = await this.userRepository.findOne({ where: { username } });

    if (!user) {
      user = await this.userRepository.findOne({ where: { email: username } });
    }

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không đúng!',
      );
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không đúng!',
      );
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Tài khoản của bạn đã bị khóa hoặc không tồn tại!',
      );
    }

    return user;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);

    if (!user) {
      throw new UnauthorizedException(
        'Tên đăng nhập hoặc mật khẩu không đúng!',
      );
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const payload: JwtPayload = {
      sub: user.id.toString(),
    };

    const tokens = await this.generateTokens(payload);

    return tokens;
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('Email không tồn tại trong hệ thống');
    }

    if (user.accountStatus !== AccountStatus.ACTIVE) {
      throw new BadRequestException('Tài khoản đã bị vô hiệu hóa');
    }

    const payload: JwtPayload = {
      sub: user.id.toString(),
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_FORGOT_PASSWORD'),
      expiresIn: this.configService.get<string>(
        'JWT_EXPIRES_IN_FORGOT_PASSWORD',
      ) as JwtSignOptions['expiresIn'],
    });

    try {
      await this.emailService.sendResetPasswordEmail({
        userInfo: {
          email: user.email,
          userName: user.username,
          role: user.role,
        },
        token,
      });
    } catch (error) {
      console.error('Error sending reset password email:', error);
      throw new BadRequestException('Không thể gửi email đặt lại mật khẩu');
    }

    return {
      message: 'Email đặt lại mật khẩu đã được gửi đến hòm thư của bạn',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET_FORGOT_PASSWORD'),
      });
    } catch {
      throw new UnauthorizedException('Token đã hết hạn hoặc không hợp lệ');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(user.id, { password: hashedPassword });

    return { message: 'Đặt lại mật khẩu thành công' };
  }

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('Người dùng không tồn tại');
    }

    const isPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Mật khẩu cũ không đúng');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });

    return { message: 'Đổi mật khẩu thành công' };
  }

  private async generateTokens(
    payload: JwtPayload,
    options: JwtSignOptions = {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>(
        'JWT_EXPIRES_IN',
      ) as JwtSignOptions['expiresIn'],
    },
  ) {
    return {
      access_token: await this.jwtService.signAsync(payload, options),
    };
  }
}
