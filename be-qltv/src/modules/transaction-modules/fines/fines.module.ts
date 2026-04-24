import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Fine } from './entities/fine.entity';
import { BorrowRecord } from 'src/modules/transaction-modules/borrow-records/entities/borrow-record.entity';
import { SystemSettingsModule } from 'src/modules/system-settings/system-settings.module';
import { BorrowRecordsModule } from 'src/modules/transaction-modules/borrow-records/borrow-records.module';
import { FinesController } from './fines.controller';
import { FinesService } from './fines.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Fine, BorrowRecord]),
    SystemSettingsModule,
    forwardRef(() => BorrowRecordsModule),
  ],
  controllers: [FinesController],
  providers: [FinesService],
  exports: [FinesService],
})
export class FinesModule {}
