import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsString,
  IsUUID,
} from 'class-validator';
import { Gender } from 'src/common/enums/gender.enum';

export class CreateReaderDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID người dùng',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID loại độc giả',
  })
  @IsUUID()
  readerTypeId: string;

  @ApiProperty({
    example: 'Nguyễn Văn A',
    description: 'Họ và tên độc giả',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    example: '2010-05-20',
    description: 'Ngày sinh',
  })
  @IsDateString()
  dob: string;

  @ApiProperty({
    enum: Gender,
    example: Gender.MALE,
    description: 'Giới tính',
  })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: 'Hà Nội',
    description: 'Địa chỉ',
  })
  @IsString()
  address: string;

  @ApiProperty({
    example: '0987654321',
    description: 'Số điện thoại',
  })
  @IsString()
  phone: string;

  @ApiProperty({
    example: 'CARD-2026-0001',
    description: 'Mã thẻ thư viện',
  })
  @IsString()
  cardNumber: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Ngày cấp thẻ',
  })
  @IsDateString()
  cardIssueDate: string;

  @ApiProperty({
    example: '2027-01-01',
    description: 'Ngày hết hạn thẻ',
  })
  @IsDateString()
  cardExpiryDate: string;

  @ApiProperty({
    example: true,
    description: 'Trạng thái hoạt động của thẻ',
  })
  @IsBoolean()
  isActive: boolean;
}
