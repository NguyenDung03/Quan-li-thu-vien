import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    example: 'password123',
    description: 'Mật khẩu cũ',
  })
  @IsNotEmpty({ message: 'Mật khẩu cũ không được để trống!' })
  @IsString({ message: 'Mật khẩu cũ phải là chuỗi!' })
  oldPassword: string;

  @ApiProperty({
    example: 'newpassword123',
    description: 'Mật khẩu mới',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống!' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi!' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' })
  newPassword: string;
}

export class ResetPasswordDto {
  @ApiProperty({
    example: 'newpassword123',
    description: 'Mật khẩu mới',
  })
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống!' })
  @IsString({ message: 'Mật khẩu mới phải là chuỗi!' })
  @MinLength(6, { message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' })
  newPassword: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token reset password',
  })
  @IsNotEmpty({ message: 'Token không được để trống!' })
  @IsString({ message: 'Token phải là chuỗi!' })
  token: string;
}

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email người dùng',
  })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  @IsString({ message: 'Email phải là chuỗi!' })
  email: string;
}
