import { Module } from '@nestjs/common';
import { AuthorsModule } from './authors/authors.module';
import { BookAuthorsModule } from './book-authors/book-authors.module';
import { BookCategoriesModule } from './book-categories/book-categories.module';
import { BookGradeLevelsModule } from './book-grade-levels/book-grade-levels.module';
import { BooksModule } from './books/books.module';
import { GradeLevelsModule } from './grade-levels/grade-levels.module';
import { PublishersModule } from './publishers/publishers.module';

@Module({
  imports: [
    AuthorsModule,
    PublishersModule,
    GradeLevelsModule,
    BookCategoriesModule,
    BooksModule,
    BookAuthorsModule,
    BookGradeLevelsModule,
  ],
})
export class CatalogModulesModule {}
