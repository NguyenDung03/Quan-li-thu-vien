import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BorrowRecord } from './entities/borrow-record.entity';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { User } from 'src/modules/user-modules/users/entities/user.entity';
import { Fine } from '../fines/entities/fine.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { SystemSettingsModule } from 'src/modules/system-settings/system-settings.module';
import { BorrowRecordsController } from './borrow-records.controller';
import { BorrowRecordsService } from './borrow-records.service';
import { BorrowRecordNotificationService } from './borrow-record-notification.service';
import { PaymentModule } from 'src/modules/payment/payment.module';

@Module({
  imports: [
    forwardRef(() => PaymentModule),
    SystemSettingsModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>(
            'JWT_EXPIRES_IN',
          ) as JwtSignOptions['expiresIn'],
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      BorrowRecord,
      Reader,
      PhysicalCopy,
      User,
      Fine,
      Book,
    ]),
  ],
  controllers: [BorrowRecordsController],
  providers: [BorrowRecordsService, BorrowRecordNotificationService],
  exports: [BorrowRecordsService],
})
export class BorrowRecordsModule {}
