import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('locations')
export class Location extends BaseEntity {
  @ApiProperty({ example: 'Kho A', description: 'Tên vị trí' })
  @Column()
  name: string;

  @ApiProperty({ example: 'kho-a', description: 'Slug' })
  @Column({ unique: true })
  slug: string;

  @ApiProperty({ example: 'Khu vực lưu trữ', description: 'Mô tả' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ example: 2, description: 'Tầng' })
  @Column({ type: 'int', nullable: true })
  floor: number;

  @ApiProperty({ example: 'A', description: 'Khu' })
  @Column({ nullable: false })
  section: string;

  @ApiProperty({ example: 'S1', description: 'Kệ' })
  @Column({ nullable: false })
  shelf: string;

  @ApiProperty({ example: true, description: 'Hoạt động' })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;
}
