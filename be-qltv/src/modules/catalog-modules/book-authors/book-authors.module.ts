import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookAuthor } from './entities/book-author.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { Author } from 'src/modules/catalog-modules/authors/entities/author.entity';
import { BookAuthorsController } from './book-authors.controller';
import { BookAuthorsService } from './book-authors.service';

@Module({
  imports: [TypeOrmModule.forFeature([BookAuthor, Book, Author])],
  controllers: [BookAuthorsController],
  providers: [BookAuthorsService],
  exports: [BookAuthorsService],
})
export class BookAuthorsModule {}
