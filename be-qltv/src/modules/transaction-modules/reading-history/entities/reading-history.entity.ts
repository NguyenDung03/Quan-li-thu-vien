import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';

@Entity('reading_history')
export class ReadingHistory extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID độc giả',
  })
  @Column({ name: 'reader_id' })
  readerId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @Column({ name: 'book_id' })
  bookId: string;

  @ApiProperty({ example: '2026-02-01T08:00:00.000Z', description: 'Bắt đầu' })
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @ApiProperty({ example: '2026-02-10T08:00:00.000Z', description: 'Kết thúc' })
  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate: Date;

  @ApiProperty({ example: 75.5, description: 'Tiến độ' })
  @Column({
    name: 'progress_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  progressPercentage: number;

  @ManyToOne(() => Reader, { nullable: false })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
