import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class RenewOfflineDto {
  @ApiPropertyOptional({
    description:
      'Số tiền thu (VND); mặc định = renewalFeeAmount trong cài đặt phạt',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  fineAmount?: number;

  @ApiPropertyOptional({
    description:
      'UUID user thủ thư thu tiền; mặc định = admin đang đăng nhập (JWT sub)',
  })
  @IsOptional()
  @IsUUID()
  collectedBy?: string;
}
