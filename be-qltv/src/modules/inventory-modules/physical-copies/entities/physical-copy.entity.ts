import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { PhysicalCopyStatus } from 'src/common/enums/physical-copy-status.enum';
import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

import { Location } from 'src/modules/inventory-modules/locations/entities/location.entity';

@Entity('physical_copies')
export class PhysicalCopy extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @Column({ name: 'book_id' })
  bookId: string;

  @ApiProperty({ example: 'BC-000001', description: 'Mã vạch' })
  @Column({ unique: true })
  barcode: string;

  @ApiProperty({
    enum: PhysicalCopyStatus,
    example: PhysicalCopyStatus.AVAILABLE,
    description: 'Trạng thái',
  })
  @Column({
    type: 'enum',
    enum: PhysicalCopyStatus,
    default: PhysicalCopyStatus.AVAILABLE,
  })
  status: PhysicalCopyStatus;

  @ApiProperty({
    enum: PhysicalCopyCondition,
    example: PhysicalCopyCondition.GOOD,
    description: 'Tình trạng',
  })
  @Column({
    type: 'enum',
    enum: PhysicalCopyCondition,
    default: PhysicalCopyCondition.GOOD,
  })
  currentCondition: PhysicalCopyCondition;

  @ApiProperty({ example: 'Không rách', description: 'Chi tiết tình trạng' })
  @Column({ name: 'condition_details', type: 'text', nullable: true })
  conditionDetails: string;

  @ApiProperty({ example: '2025-01-10', description: 'Ngày mua' })
  @Column({ name: 'purchase_date', type: 'date', nullable: true })
  purchaseDate: Date;

  @ApiProperty({ example: 125000, description: 'Giá mua' })
  @Column({
    name: 'purchase_price',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  purchasePrice: number;

  @ApiProperty({
    example: 150000,
    description:
      'Giá tham chiếu / bìa (ưu tiên cho tính phạt mất sách, làm hỏng; nếu null dùng purchase_price)',
  })
  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  price: number;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID vị trí',
  })
  @Column({ name: 'location_id' })
  locationId: string;

  @ApiProperty({ example: 'Ghi chú', description: 'Ghi chú' })
  @Column({ type: 'text', nullable: true })
  notes: string;

  @ApiProperty({ example: '2025-02-01', description: 'Ngày kiểm tra' })
  @Column({ name: 'last_checkup_date', type: 'date', nullable: true })
  lastCheckupDate: Date;

  @ApiProperty({ example: false, description: 'Lưu trữ' })
  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Location, { nullable: false })
  @JoinColumn({ name: 'location_id' })
  location: Location;
}
