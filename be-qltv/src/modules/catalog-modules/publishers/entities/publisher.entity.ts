import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('publishers')
export class Publisher extends BaseEntity {
  @ApiProperty({ example: 'NXB Giáo Dục', description: 'Tên nhà xuất bản' })
  @Column({ name: 'publisher_name' })
  publisherName: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Địa chỉ' })
  @Column({ type: 'text', nullable: true })
  address: string;

  @ApiProperty({ example: '02412345678', description: 'Số điện thoại' })
  @Column({ nullable: false })
  phone: string;

  @ApiProperty({ example: 'nxb@example.com', description: 'Email' })
  @Column({ nullable: false })
  email: string;
}
