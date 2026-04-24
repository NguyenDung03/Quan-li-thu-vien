import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { DocumentModule } from '../crawl-modules/document/document.module';
import { Document } from '../crawl-modules/document/document.entity';

@Module({
  imports: [DocumentModule, TypeOrmModule.forFeature([Document])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
