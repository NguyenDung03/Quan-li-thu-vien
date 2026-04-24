import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { Gender } from 'src/common/enums/gender.enum';
import { UserRole } from 'src/common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({ example: 'john_doe', description: 'Tên đăng nhập' })
  @IsString()
  @MinLength(4)
  username: string;

  @ApiProperty({ example: 'john@example.com', description: 'Địa chỉ Email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Mật khẩu' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.READER,
    description: 'Vai trò người dùng',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiProperty({
    enum: AccountStatus,
    example: AccountStatus.ACTIVE,
    description: 'Trạng thái tài khoản',
    required: false,
  })
  @IsOptional()
  @IsEnum(AccountStatus)
  accountStatus?: AccountStatus;

  @ApiProperty({
    example: '2008-01-15',
    description: 'Ngày sinh (YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dob?: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Giới tính',
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    example: '123 Đường ABC, Quận XYZ, TP.HCM',
    description: 'Địa chỉ',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    example: '+84123456789',
    description: 'Số điện thoại',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID loại độc giả (Student/Teacher/Staff)',
    required: false,
  })
  @IsOptional()
  @IsString()
  readerTypeId?: string;

  @ApiProperty({
    example: 'HDA-STU-2600001',
    description: 'Mã thẻ thư viện (nếu không cung cấp sẽ tự động tạo)',
    required: false,
  })
  @IsOptional()
  @IsString()
  cardNumber?: string;
}
