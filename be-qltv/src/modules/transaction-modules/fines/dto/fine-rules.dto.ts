import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FineRulesResponseDto {
  @ApiProperty({
    example: 5000,
    description: 'Tiền phạt mỗi ngày quá hạn (VND)',
  })
  overdueFeePerDay: number;

  @ApiProperty({ enum: ['fixed', 'percent'] })
  damagedBookFineMode: 'fixed' | 'percent';

  @ApiProperty({
    description: 'Phạt làm hỏng — mức cố định (VND), khi mode = fixed',
  })
  damagedBookFineFixed: number;

  @ApiProperty({
    description:
      'Phạt làm hỏng — % purchase_price bản sao (0–100), khi mode = percent',
  })
  damagedBookFinePercent: number;

  @ApiProperty({
    enum: ['percent', 'fixed'],
    description:
      'Mất sách — percent: chỉ % giá tham chiếu; fixed: chỉ phí cố định (một trong hai)',
  })
  lostBookFineMode: 'percent' | 'fixed';

  @ApiProperty({
    description:
      'Mất sách — % giá tham chiếu khi lostBookFineMode = percent (ví dụ 150)',
  })
  lostBookReimbursePercent: number;

  @ApiProperty({
    description: 'Mất sách — phí cố định (VND) khi lostBookFineMode = fixed',
  })
  lostBookProcessingFee: number;

  @ApiProperty({
    description:
      'Số ngày quá hạn liên tiếp để hệ thống tự coi là mất sách (job)',
  })
  lostBookOverdueDaysAsLost: number;

  @ApiProperty({
    example: 10000,
    description:
      'Phí gia hạn một lần (VND), luồng PayOS POST borrow-records/:id/renew',
  })
  renewalFeeAmount: number;
}

export class UpdateFineRulesDto {
  @ApiProperty({ example: 5000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  overdueFeePerDay: number;

  @ApiProperty({ enum: ['fixed', 'percent'] })
  @IsIn(['fixed', 'percent'])
  damagedBookFineMode: 'fixed' | 'percent';

  @ApiProperty({ example: 50000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  damagedBookFineFixed: number;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  damagedBookFinePercent: number;

  @ApiProperty({ enum: ['percent', 'fixed'] })
  @IsIn(['percent', 'fixed'])
  lostBookFineMode: 'percent' | 'fixed';

  @ApiProperty({ example: 150 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(500)
  lostBookReimbursePercent: number;

  @ApiProperty({ example: 20000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lostBookProcessingFee: number;

  @ApiProperty({ example: 30 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  lostBookOverdueDaysAsLost: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  renewalFeeAmount?: number;
}
