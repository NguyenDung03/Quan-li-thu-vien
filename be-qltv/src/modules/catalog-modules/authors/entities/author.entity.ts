import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity } from 'typeorm';

@Entity('authors')
export class Author extends BaseEntity {
  @ApiProperty({ example: 'Nguyễn Nhật Ánh', description: 'Tên tác giả' })
  @Column({ name: 'author_name' })
  authorName: string;

  @ApiProperty({ example: 'Tiểu sử ngắn', description: 'Tiểu sử' })
  @Column({ type: 'text', nullable: true })
  bio: string;

  @ApiProperty({ example: 'Việt Nam', description: 'Quốc tịch' })
  @Column({ nullable: false })
  nationality: string;
}
