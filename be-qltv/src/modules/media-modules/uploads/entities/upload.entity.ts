import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('uploads')
export class Upload extends BaseEntity {
  @ApiProperty({ example: 'tailieu.pdf', description: 'Tên gốc' })
  @Column({ name: 'original_name' })
  originalName: string;

  @ApiProperty({ example: 'tailieu-1.pdf', description: 'Tên file' })
  @Column({ name: 'file_name' })
  fileName: string;

  @ApiProperty({ example: 'tailieu-1', description: 'Slug' })
  @Column()
  slug: string;

  @ApiProperty({ example: '/uploads/tailieu-1.pdf', description: 'Đường dẫn' })
  @Column({ name: 'file_path' })
  filePath: string;

  @ApiProperty({ example: 102400, description: 'Kích thước' })
  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @ApiProperty({ example: 'application/pdf', description: 'MIME type' })
  @Column({ name: 'mime_type' })
  mimeType: string;

  @ApiProperty({ example: 'pdf', description: 'Định dạng file' })
  @Column({ name: 'file_format' })
  fileFormat: string;
}
