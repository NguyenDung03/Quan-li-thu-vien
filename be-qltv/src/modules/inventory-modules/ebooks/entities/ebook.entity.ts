import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

@Entity('ebooks')
export class Ebook extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @Column({ name: 'book_id' })
  bookId: string;

  @ApiProperty({ example: '/files/book.pdf', description: 'Đường dẫn file' })
  @Column({ name: 'file_path' })
  filePath: string;

  @ApiProperty({ example: 2048000, description: 'Kích thước' })
  @Column({ name: 'file_size', type: 'int' })
  fileSize: number;

  @ApiProperty({ example: 'pdf', description: 'Định dạng' })
  @Column({ name: 'file_format' })
  fileFormat: string;

  @ApiProperty({ example: 0, description: 'Lượt tải' })
  @Column({ name: 'download_count', type: 'int', default: 0 })
  downloadCount: number;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
