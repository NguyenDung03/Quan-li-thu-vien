import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('book_categories')
export class BookCategory extends BaseEntity {
  @ApiProperty({ example: 'Văn học', description: 'Tên danh mục' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID danh mục cha',
  })
  @Column({ name: 'parent_id', nullable: true })
  parentId: string;
}
