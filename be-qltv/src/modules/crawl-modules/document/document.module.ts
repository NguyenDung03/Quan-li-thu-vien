import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { WorkerController } from './worker.controller';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Document])],
  controllers: [WorkerController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
