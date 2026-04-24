import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('images')
export class Image extends BaseEntity {
  @ApiProperty({ example: 'cover.jpg', description: 'Tên gốc' })
  @Column({ name: 'original_name' })
  originalName: string;

  @ApiProperty({ example: 'cover-1.jpg', description: 'Tên file' })
  @Column({ name: 'file_name' })
  fileName: string;

  @ApiProperty({ example: 'cover-1', description: 'Slug' })
  @Column()
  slug: string;

  @ApiProperty({
    example: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
    description: 'URL Cloudinary',
  })
  @Column({ name: 'cloudinary_url', type: 'text' })
  cloudinaryUrl: string;

  @ApiProperty({ example: 'library/cover-1', description: 'Public ID' })
  @Column({ name: 'cloudinary_public_id' })
  cloudinaryPublicId: string;

  @ApiProperty({ example: 102400, description: 'Kích thước file' })
  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @ApiProperty({ example: 'image/jpeg', description: 'MIME type' })
  @Column({ name: 'mime_type' })
  mimeType: string;

  @ApiProperty({ example: 1200, description: 'Chiều rộng' })
  @Column({ type: 'int', nullable: true })
  width: number;

  @ApiProperty({ example: 1800, description: 'Chiều cao' })
  @Column({ type: 'int', nullable: true })
  height: number;

  @ApiProperty({ example: 'jpg', description: 'Định dạng' })
  @Column({ nullable: false })
  format: string;
}
