import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Reader } from '../../readers/entities/reader.entity';

@Entity('reader_types')
export class ReaderType extends BaseEntity {
  @ApiProperty({ example: 'Student', description: 'Tên loại độc giả' })
  @Column({ name: 'type_name' })
  typeName: string;

  @ApiProperty({ example: 5, description: 'Số sách mượn tối đa' })
  @Column({ name: 'max_borrow_limit', type: 'int' })
  maxBorrowLimit: number;

  @ApiProperty({ example: 14, description: 'Thời gian mượn (ngày)' })
  @Column({ name: 'borrow_duration_days', type: 'int' })
  borrowDurationDays: number;

  @OneToMany(() => Reader, (reader) => reader.readerType)
  readers: Reader[];
}
