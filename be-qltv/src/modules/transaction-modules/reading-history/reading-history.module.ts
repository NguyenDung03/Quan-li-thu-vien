import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReadingHistory } from './entities/reading-history.entity';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { ReadingHistoryController } from './reading-history.controller';
import { ReadingHistoryService } from './reading-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReadingHistory, Reader, Book])],
  controllers: [ReadingHistoryController],
  providers: [ReadingHistoryService],
  exports: [ReadingHistoryService],
})
export class ReadingHistoryModule {}
