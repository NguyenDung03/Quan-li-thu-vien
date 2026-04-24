import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PhysicalCopy } from './entities/physical-copy.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { Location } from 'src/modules/inventory-modules/locations/entities/location.entity';
import { PhysicalCopiesController } from './physical-copies.controller';
import { PhysicalCopiesService } from './physical-copies.service';

@Module({
  imports: [TypeOrmModule.forFeature([PhysicalCopy, Book, Location])],
  controllers: [PhysicalCopiesController],
  providers: [PhysicalCopiesService],
  exports: [PhysicalCopiesService],
})
export class PhysicalCopiesModule {}
