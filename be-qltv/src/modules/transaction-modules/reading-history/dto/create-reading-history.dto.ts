import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateReadingHistoryDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID độc giả',
  })
  @IsUUID()
  readerId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @IsUUID()
  bookId: string;

  @ApiProperty({ example: '2026-02-01T08:00:00.000Z', description: 'Bắt đầu' })
  @IsDateString()
  startDate: string;

  @ApiPropertyOptional({
    example: '2026-02-10T08:00:00.000Z',
    description: 'Kết thúc',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 75.5, description: 'Tiến độ' })
  @IsNumber()
  progressPercentage: number;
}
