import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateImageDto {
  @ApiProperty({ example: 'cover.jpg', description: 'Tên gốc' })
  @IsString()
  originalName: string;

  @ApiProperty({ example: 'cover-1.jpg', description: 'Tên file' })
  @IsString()
  fileName: string;

  @ApiProperty({ example: 'cover-1', description: 'Slug' })
  @IsString()
  slug: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    description: 'URL Cloudinary',
  })
  @IsString()
  cloudinaryUrl: string;

  @ApiProperty({ example: 'library/cover-1', description: 'Public ID' })
  @IsString()
  cloudinaryPublicId: string;

  @ApiProperty({ example: 102400, description: 'Kích thước file' })
  @IsNumber()
  @IsInt()
  fileSize: number;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME type' })
  @IsString()
  mimeType: string;

  @ApiPropertyOptional({ example: 1200, description: 'Chiều rộng' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  width?: number;

  @ApiPropertyOptional({ example: 1800, description: 'Chiều cao' })
  @IsOptional()
  @IsNumber()
  @IsInt()
  height?: number;

  @ApiPropertyOptional({ example: 'jpg', description: 'Định dạng' })
  @IsOptional()
  @IsString()
  format?: string;
}
