import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { Publisher } from 'src/modules/catalog-modules/publishers/entities/publisher.entity';
import { BookCategory } from 'src/modules/catalog-modules/book-categories/entities/book-category.entity';
import { Image } from 'src/modules/media-modules/images/entities/image.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { Ebook } from 'src/modules/inventory-modules/ebooks/entities/ebook.entity';
import { Location } from 'src/modules/inventory-modules/locations/entities/location.entity';
import { Upload } from 'src/modules/media-modules/uploads/entities/upload.entity';
import { BookAuthor } from 'src/modules/catalog-modules/book-authors/entities/book-author.entity';
import { BookGradeLevel } from 'src/modules/catalog-modules/book-grade-levels/entities/book-grade-level.entity';
import { BorrowRecord } from 'src/modules/transaction-modules/borrow-records/entities/borrow-record.entity';
import { Reservation } from 'src/modules/transaction-modules/reservations/entities/reservation.entity';
import { Fine } from 'src/modules/transaction-modules/fines/entities/fine.entity';
import { ReadingHistory } from 'src/modules/transaction-modules/reading-history/entities/reading-history.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      Publisher,
      BookCategory,
      Image,
      PhysicalCopy,
      Ebook,
      Location,
      Upload,
      BookAuthor,
      BookGradeLevel,
      BorrowRecord,
      Reservation,
      Fine,
      ReadingHistory,
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}
