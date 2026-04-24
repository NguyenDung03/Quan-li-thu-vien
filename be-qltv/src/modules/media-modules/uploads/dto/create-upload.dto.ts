import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateUploadDto {
  @ApiProperty({ example: 'tailieu.pdf', description: 'Tên gốc' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'tailieu-1.pdf', description: 'Tên file' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'tailieu-1', description: 'Slug' })
  @IsString()
  slug: string;

  @ApiProperty({ example: '/uploads/tailieu-1.pdf', description: 'Đường dẫn' })
  @IsString()
  filePath: string;

  @ApiProperty({ example: 102400, description: 'Kích thước' })
  @IsNumber()
  @IsInt()
  fileSize: number;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type' })
  @IsString()
  mimeType: string;
}
