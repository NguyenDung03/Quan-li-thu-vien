import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class RenewBorrowPayOsDto {
  @ApiPropertyOptional({
    description: 'URL return; mặc định PAYOS_RETURN_URL (.env)',
  })
  @IsOptional()
  @IsString()
  returnUrl?: string;

  @ApiPropertyOptional({
    description: 'URL hủy; mặc định PAYOS_CANCEL_URL (.env)',
  })
  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
