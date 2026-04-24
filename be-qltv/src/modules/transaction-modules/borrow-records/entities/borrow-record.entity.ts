import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { BorrowRecordStatus } from 'src/common/enums/borrow-record-status.enum';
import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';

import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';

import { User } from 'src/modules/user-modules/users/entities/user.entity';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

@Entity('borrow_records')
export class BorrowRecord extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID độc giả',
  })
  @Column({ name: 'reader_id' })
  readerId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID bản sao',
  })
  @Column({ name: 'copy_id' })
  copyId: string;

  @ApiProperty({
    example: '2026-03-01T08:00:00.000Z',
    description: 'Ngày mượn',
  })
  @Column({ name: 'borrow_date', type: 'timestamp' })
  borrowDate: Date;

  @ApiProperty({
    example: '2026-03-15T08:00:00.000Z',
    description: 'Ngày đến hạn',
  })
  @Column({ name: 'due_date', type: 'timestamp' })
  dueDate: Date;

  @ApiProperty({ example: '2026-03-10T08:00:00.000Z', description: 'Ngày trả' })
  @Column({ name: 'return_date', type: 'timestamp', nullable: true })
  returnDate: Date;

  @ApiProperty({
    enum: BorrowRecordStatus,
    example: BorrowRecordStatus.BORROWED,
    description: 'Trạng thái',
  })
  @Column({
    type: 'enum',
    enum: BorrowRecordStatus,
    default: BorrowRecordStatus.BORROWED,
  })
  status: BorrowRecordStatus;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID thủ thư',
  })
  @Column({ name: 'librarian_id' })
  librarianId: string;

  @ApiProperty({
    example: false,
    description: 'Đã được gia hạn hay chưa',
  })
  @Column({ name: 'is_renewed', default: false })
  isRenewed: boolean;

  @ApiProperty({
    enum: PhysicalCopyCondition,
    required: false,
    description: 'Tình trạng bản sao tại thời điểm mượn (để so khi trả)',
  })
  @Column({
    name: 'condition_at_borrow',
    type: 'enum',
    enum: PhysicalCopyCondition,
    nullable: true,
  })
  conditionAtBorrow: PhysicalCopyCondition;

  @ManyToOne(() => Reader, { nullable: false })
  @JoinColumn({ name: 'reader_id' })
  reader: Reader;

  @ManyToOne(() => PhysicalCopy, { nullable: false })
  @JoinColumn({ name: 'copy_id' })
  copy: PhysicalCopy;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'librarian_id' })
  librarian: User;

  @ManyToOne(() => Book, { nullable: true })
  @JoinColumn({ name: 'book_id' })
  book?: Book;
}
