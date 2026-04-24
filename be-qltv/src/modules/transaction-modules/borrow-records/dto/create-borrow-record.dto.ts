import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBorrowRecordDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID độc giả',
  })
  @IsUUID()
  readerId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID bản sao',
  })
  @IsUUID()
  copyId: string;

  @ApiProperty({
    example: '2026-03-01T08:00:00.000Z',
    description: 'Ngày mượn',
  })
  @IsDateString()
  borrowDate: string;

  @ApiProperty({
    example: '2026-03-15T08:00:00.000Z',
    description: 'Ngày đến hạn',
  })
  @IsDateString()
  dueDate: string;

  @ApiPropertyOptional({
    example: '2026-03-10T08:00:00.000Z',
    description: 'Ngày trả',
  })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiProperty({ example: 'borrowed', description: 'Trạng thái' })
  @IsString()
  status: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID thủ thư',
  })
  @IsUUID()
  librarianId: string;
}
