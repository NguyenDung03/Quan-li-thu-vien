import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('grade_levels')
export class GradeLevel extends BaseEntity {
  @ApiProperty({ example: 'Lớp 10', description: 'Tên khối lớp' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Khối lớp 10', description: 'Mô tả' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 10, description: 'Thứ tự' })
  @Column({ name: 'order_no', type: 'int' })
  orderNo: number;
}
