import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReaderType } from '../reader-types/entities/reader-type.entity';
import { User } from '../users/entities/user.entity';
import { Reader } from './entities/reader.entity';
import { ReadersController } from './readers.controller';
import { ReadersService } from './readers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reader, User, ReaderType])],
  controllers: [ReadersController],
  providers: [ReadersService],
  exports: [ReadersService],
})
export class ReadersModule {}
