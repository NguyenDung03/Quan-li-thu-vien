import { HttpModule } from '@nestjs/axios';
import { Module, forwardRef } from '@nestjs/common';

import { FinesModule } from 'src/modules/transaction-modules/fines/fines.module';
import { BorrowRecordsModule } from 'src/modules/transaction-modules/borrow-records/borrow-records.module';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';

@Module({
  imports: [HttpModule, FinesModule, forwardRef(() => BorrowRecordsModule)],
  controllers: [PaymentController],
  providers: [PaymentService],
  exports: [PaymentService],
})
export class PaymentModule {}
