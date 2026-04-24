import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateFineDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID phiếu mượn',
  })
  @IsUUID()
  borrowId: string;

  @ApiProperty({ example: 15000, description: 'Tiền phạt' })
  @IsNumber()
  fineAmount: number;

  @ApiProperty({
    example: '2026-03-20T08:00:00.000Z',
    description: 'Ngày phạt',
  })
  @IsDateString()
  fineDate: string;

  @ApiProperty({ example: 'Trả trễ', description: 'Lý do' })
  @IsString()
  reason: string;

  @ApiProperty({ example: 'unpaid', description: 'Trạng thái' })
  @IsString()
  status: string;

  @ApiPropertyOptional({
    example: '2026-03-22T08:00:00.000Z',
    description: 'Ngày thanh toán',
  })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;
}
