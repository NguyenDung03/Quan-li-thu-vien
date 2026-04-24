import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID khoản phạt (bảng fines); không dùng làm orderCode PayOS',
  })
  @IsUUID()
  fineId!: string;

  @ApiPropertyOptional({
    description:
      'Mô tả PayOS (tùy chọn); server sẽ bỏ dấu + cắt tối đa 25 ký tự. Nếu bỏ trống dùng `reason` trong DB.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Số tiền (VND); nếu gửi phải khớp fine_amount',
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    description: 'URL return; nếu không gửi dùng PAYOS_RETURN_URL (.env)',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'URL hủy; nếu không gửi dùng PAYOS_CANCEL_URL (.env)',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
