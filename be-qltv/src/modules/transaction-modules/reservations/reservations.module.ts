import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservation } from './entities/reservation.entity';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { BorrowRecord } from '../borrow-records/entities/borrow-record.entity';
import { Fine } from '../fines/entities/fine.entity';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { User } from 'src/modules/user-modules/users/entities/user.entity';
import { ReservationNotificationService } from './reservation-notification.service';

@Module({
  imports: [
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
      Reservation,
      Reader,
      Book,
      PhysicalCopy,
      BorrowRecord,
      Fine,
      User,
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationNotificationService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
