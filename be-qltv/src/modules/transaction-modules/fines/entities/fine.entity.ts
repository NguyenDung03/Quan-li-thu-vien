import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';
import { FinePaymentMethod } from 'src/common/enums/fine-payment-method.enum';
import { FineStatus } from 'src/common/enums/fine-status.enum';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { BorrowRecord } from 'src/modules/transaction-modules/borrow-records/entities/borrow-record.entity';
import { User } from 'src/modules/user-modules/users/entities/user.entity';

@Entity('fines')
export class Fine extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID phiếu mượn',
  })
  @Column({ name: 'borrow_id' })
  borrowId: string;

  @ApiProperty({ example: 15000, description: 'Tiền phạt' })
  @Column({ name: 'fine_amount', type: 'decimal', precision: 12, scale: 2 })
  fineAmount: number;

  @ApiProperty({
    example: '2026-03-20T08:00:00.000Z',
    description: 'Ngày phạt',
  })
  @Column({ name: 'fine_date', type: 'timestamp' })
  fineDate: Date;

  @ApiProperty({ example: 'Trả trễ', description: 'Lý do' })
  @Column({ type: 'text' })
  reason: string;

  @ApiProperty({
    enum: FineStatus,
    example: FineStatus.UNPAID,
    description: 'Trạng thái',
  })
  @Column({
    type: 'enum',
    enum: FineStatus,
    default: FineStatus.UNPAID,
  })
  status: FineStatus;

  @ApiProperty({
    example: '2026-03-22T08:00:00.000Z',
    description: 'Ngày thanh toán',
    required: false,
  })
  @Column({ name: 'payment_date', type: 'timestamp', nullable: true })
  paymentDate: Date | null;

  @ApiProperty({
    example: 12345678,
    description:
      'Mã số nguyên PayOS (orderCode), duy nhất toàn bảng; sinh trước khi gọi API PayOS',
    required: false,
  })
  @Column({ name: 'payment_code', type: 'int', nullable: true, unique: true })
  paymentCode: number | null;

  @ApiProperty({
    required: false,
    description:
      'URL checkout PayOS (text, nullable); lưu sau khi tạo link thanh toán thành công',
  })
  @Column({ name: 'payos_checkout_url', type: 'text', nullable: true })
  payosCheckoutUrl: string | null;

  @ApiProperty({
    enum: FinePaymentMethod,
    description: 'Phương thức thanh toán',
    required: false,
  })
  @Column({
    name: 'payment_method',
    type: 'enum',
    enum: FinePaymentMethod,
    nullable: true,
  })
  paymentMethod: FinePaymentMethod | null;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID thủ thư thu tiền',
    required: false,
  })
  @Column({ name: 'collected_by', nullable: true })
  collectedBy: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'collected_by' })
  collector: User | null;

  @ManyToOne(() => BorrowRecord, { nullable: false })
  @JoinColumn({ name: 'borrow_id' })
  borrow: BorrowRecord;
}
