import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReaderType } from './entities/reader-type.entity';
import { ReaderTypesController } from './reader-types.controller';
import { ReaderTypesService } from './reader-types.service';

@Module({
  imports: [TypeOrmModule.forFeature([ReaderType])],
  controllers: [ReaderTypesController],
  providers: [ReaderTypesService],
  exports: [ReaderTypesService],
})
export class ReaderTypesModule {}
