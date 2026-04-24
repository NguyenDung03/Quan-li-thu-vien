import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';

export class CreateReservationDto {
  @ApiPropertyOptional({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description:
      'ID độc giả (không dùng — server lấy từ JWT; giữ field để tương thích client cũ)',
  })
  @IsOptional()
  @IsUUID()
  readerId?: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @IsUUID()
  bookId: string;
}
