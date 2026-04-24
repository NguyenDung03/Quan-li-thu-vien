import { Module } from '@nestjs/common';
import { BorrowRecordsModule } from './borrow-records/borrow-records.module';
import { FinesModule } from './fines/fines.module';
import { ReadingHistoryModule } from './reading-history/reading-history.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    BorrowRecordsModule,
    ReservationsModule,
    FinesModule,
    ReadingHistoryModule,
  ],
})
export class TransactionModulesModule {}
