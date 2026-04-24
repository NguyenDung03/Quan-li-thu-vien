import { ApiProperty } from '@nestjs/swagger';

import { BaseEntity } from 'src/common/entities/base.entity';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { Author } from 'src/modules/catalog-modules/authors/entities/author.entity';

import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';

@Entity('book_authors')
export class BookAuthor extends BaseEntity {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID sách',
  })
  @Column({ name: 'book_id' })
  bookId: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'ID tác giả',
  })
  @Column({ name: 'author_id' })
  authorId: string;

  @ManyToOne(() => Book, { nullable: false })
  @JoinColumn({ name: 'book_id' })
  book: Book;

  @ManyToOne(() => Author, { nullable: false })
  @JoinColumn({ name: 'author_id' })
  author: Author;
}
