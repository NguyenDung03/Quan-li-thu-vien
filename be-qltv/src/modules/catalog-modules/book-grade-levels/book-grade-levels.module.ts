import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { GradeLevel } from 'src/modules/catalog-modules/grade-levels/entities/grade-level.entity';
import { BookGradeLevelsController } from './book-grade-levels.controller';
import { BookGradeLevelsService } from './book-grade-levels.service';
import { BookGradeLevel } from './entities/book-grade-level.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BookGradeLevel, Book, GradeLevel])],
  controllers: [BookGradeLevelsController],
  providers: [BookGradeLevelsService],
  exports: [BookGradeLevelsService],
})
export class BookGradeLevelsModule {}
