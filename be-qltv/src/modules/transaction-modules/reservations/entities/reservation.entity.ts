import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';

import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';

@Entity('reservations')
export class Reservation extends BaseEntity {
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

  @ApiProperty({ example: '2026-03-01T08:00:00.000Z', description: 'Ngày đặt' })
  @Column({ name: 'reservation_date', type: 'timestamp' })
  reservationDate: Date;

  @ApiProperty({
    example: '2026-03-05T08:00:00.000Z',
    description: 'Ngày hết hạn',
  })
  @Column({ name: 'expiry_date', type: 'timestamp' })
  expiryDate: Date;

  @ApiProperty({
    enum: ReservationStatus,
    example: ReservationStatus.PENDING,
    description: 'Trạng thái',
  })
  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @ApiProperty({
    example: 'Không có nhu cầu',
    description: 'Lý do hủy (khi status là CANCELLED)',
  })
  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string;

  @ManyToOne(() => Reader, { nullable: false })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID bản in (copy)',
    required: false,
  })
  @Column({ name: 'copy_id', nullable: true })
  copyId: string;

  @ManyToOne(() => PhysicalCopy, { nullable: true })
  @JoinColumn({ name: 'copy_id' })
  copy: PhysicalCopy;
}
