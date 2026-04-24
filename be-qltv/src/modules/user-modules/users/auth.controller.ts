import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from 'src/common/guards/jwt.guard';
import { JwtPayload } from 'src/common/types/jwt.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/auth.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password.dto';

@ApiTags('🔓 Xác thực người dùng (Auth)')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đăng nhập',
    description: 'Xác thực thông tin đăng nhập và trả về JWT access token.',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Đăng nhập thành công, trả về access token.',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Tên đăng nhập hoặc mật khẩu không đúng.',
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Quên mật khẩu',
    description: 'Gửi email chứa link đặt lại mật khẩu.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Email đặt lại mật khẩu đã được gửi.',
    schema: {
      example: {
        message: 'Email đặt lại mật khẩu đã được gửi đến hòm thư của bạn',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 404,
    description: 'Email không tồn tại trong hệ thống.',
  })
  async forgotPassword(@Body() payload: ForgotPasswordDto) {
    return await this.authService.forgotPassword(payload.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Đặt lại mật khẩu',
    description: 'Đặt lại mật khẩu bằng token.',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Đặt lại mật khẩu thành công.',
    schema: {
      example: {
        message: 'Đặt lại mật khẩu thành công',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({
    status: 401,
    description: 'Token đã hết hạn hoặc không hợp lệ.',
  })
  async resetPassword(@Body() payload: ResetPasswordDto) {
    return await this.authService.resetPassword(
      payload.token,
      payload.newPassword,
    );
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Đổi mật khẩu',
    description: 'Đổi mật khẩu khi đã đăng nhập.',
  })
  @ApiBody({ type: ChangePasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Đổi mật khẩu thành công.',
    schema: {
      example: {
        message: 'Đổi mật khẩu thành công',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Dữ liệu đầu vào không hợp lệ.' })
  @ApiResponse({ status: 401, description: 'Mật khẩu cũ không đúng.' })
  async changePassword(
    @Body() payload: ChangePasswordDto,
    @Req() req: { user: JwtPayload },
  ) {
    return await this.authService.changePassword(
      req.user.sub,
      payload.oldPassword,
      payload.newPassword,
    );
  }
}
