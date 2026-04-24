import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ebook } from './entities/ebook.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { EbooksController } from './ebooks.controller';
import { EbooksService } from './ebooks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ebook, Book])],
  controllers: [EbooksController],
  providers: [EbooksService],
  exports: [EbooksService],
})
export class EbooksModule {}
