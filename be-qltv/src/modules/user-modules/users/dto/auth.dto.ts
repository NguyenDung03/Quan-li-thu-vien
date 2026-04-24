import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin2', description: 'Tên đăng nhập' })
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống!' })
  @IsString({ message: 'Tên đăng nhập phải là chuỗi!' })
  username: string;

  @ApiProperty({
    example: 'password',
    description: 'Mật khẩu',
    minLength: 6,
  })
  @IsNotEmpty({ message: 'Mật khẩu không được để trống!' })
  @IsString({ message: 'Mật khẩu phải là chuỗi!' })
  @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự!' })
  password: string;
}
