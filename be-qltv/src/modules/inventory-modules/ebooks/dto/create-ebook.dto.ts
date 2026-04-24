import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEbookDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @IsUUID()
  bookId: string;

  @ApiProperty({ example: '/files/book.pdf', description: 'Đường dẫn file' })
  @IsString()
  filePath: string;

  @ApiProperty({ example: 2048000, description: 'Kích thước' })
  @IsNumber()
  @IsInt()
  fileSize: number;

  @ApiProperty({ example: 'pdf', description: 'Định dạng' })
  @IsString()
  fileFormat: string;

  @ApiPropertyOptional({ example: 0, description: 'Lượt tải' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  downloadCount?: number;
}
