import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Gender } from 'src/common/enums/gender.enum';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { ReaderType } from '../../reader-types/entities/reader-type.entity';
import { User } from '../../users/entities/user.entity';

@Entity('readers')
export class Reader extends BaseEntity {
  @ApiProperty({ description: 'ID người dùng liên kết' })
  @Column({ name: 'user_id' })
  userId: string;

  @ApiProperty({ description: 'ID loại độc giả' })
  @Column({ name: 'reader_type_id' })
  readerTypeId: string;

  @OneToOne(() => User, (user) => user.reader)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ReaderType, (readerType) => readerType.readers)
  @JoinColumn({ name: 'reader_type_id' })
  readerType: ReaderType;

  @ApiProperty({ example: 'John Doe', description: 'Họ và tên' })
  @Column({ name: 'full_name' })
  fullName: string;

  @ApiProperty({ example: '1990-01-01', description: 'Ngày sinh' })
  @Column({ type: 'date' })
  dob: Date;

  @ApiProperty({ enum: Gender, example: Gender.MALE, description: 'Giới tính' })
  @Column({ type: 'enum', enum: Gender })
  gender: Gender;

  @ApiProperty({ example: '123 Main St', description: 'Địa chỉ' })
  @Column({ type: 'text' })
  address: string;

  @ApiProperty({ example: '+84123456789', description: 'Số điện thoại' })
  @Column()
  phone: string;

  @ApiProperty({ example: 'CARD-123456', description: 'Mã thẻ thư viện' })
  @Column({ name: 'card_number', unique: true })
  cardNumber: string;

  @ApiProperty({ example: '2023-01-01', description: 'Ngày cấp thẻ' })
  @Column({ name: 'card_issue_date', type: 'date' })
  cardIssueDate: Date;

  @ApiProperty({ example: '2024-01-01', description: 'Ngày hết hạn thẻ' })
  @Column({ name: 'card_expiry_date', type: 'date' })
  cardExpiryDate: Date;

  @ApiProperty({ example: true, description: 'Trạng thái hoạt động' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
