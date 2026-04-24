import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { BorrowRecordStatus } from 'src/common/enums/borrow-record-status.enum';
import { FineStatus } from 'src/common/enums/fine-status.enum';
import { PhysicalCopyStatus } from 'src/common/enums/physical-copy-status.enum';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { Repository } from 'typeorm';
import { BorrowRecord } from '../borrow-records/entities/borrow-record.entity';
import { Fine } from '../fines/entities/fine.entity';
import { FilterReservationDto } from './dto/filter-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { Reservation } from './entities/reservation.entity';
import { ReservationNotificationService } from './reservation-notification.service';
import { User } from 'src/modules/user-modules/users/entities/user.entity';
import { UserRole } from 'src/common/enums/user-role.enum';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly repository: Repository<Reservation>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly reservationNotificationService: ReservationNotificationService,
  ) {}

  async create(readerId: string, bookId: string): Promise<Reservation> {
    const reader = await this.readerRepository.findOne({
      where: { id: readerId },
      relations: ['readerType', 'user'],
    });
    if (!reader) throw new BadRequestException('Độc giả không tồn tại');

    if (!reader.isActive) {
      throw new BadRequestException('Tài khoản độc giả đã bị vô hiệu hóa');
    }

    const book = await this.bookRepository.findOne({
      where: { id: bookId },
    });
    if (!book) throw new BadRequestException('Sách không tồn tại');

    const unpaidFines = await this.fineRepository.count({
      where: {
        borrow: {
          reader: { id: readerId },
        },
        status: FineStatus.UNPAID,
      },
      relations: ['borrow'],
    });
    if (unpaidFines > 0) {
      throw new BadRequestException('Độc giả có phiếu phạt chưa thanh toán');
    }

    const availableCopies = await this.physicalCopyRepository.find({
      where: {
        book: { id: bookId },
        status: PhysicalCopyStatus.AVAILABLE,
      },
    });
    if (availableCopies.length === 0) {
      throw new BadRequestException('Không có bản sao sách nào có sẵn');
    }

    const currentBorrowedCount = await this.borrowRecordRepository.count({
      where: {
        reader: { id: readerId },
        status: BorrowRecordStatus.BORROWED,
      },
    });
    if (
      reader.readerType &&
      currentBorrowedCount >= reader.readerType.maxBorrowLimit
    ) {
      throw new BadRequestException(
        `Độc giả đã mượn tối đa ${reader.readerType.maxBorrowLimit} cuốn sách`,
      );
    }

    const overdueRecords = await this.borrowRecordRepository.count({
      where: {
        reader: { id: readerId },
        status: BorrowRecordStatus.OVERDUE,
      },
    });
    if (overdueRecords > 0) {
      throw new BadRequestException('Độc giả có sách quá hạn chưa trả');
    }

    const reservationDate = new Date();
    const expiryDate = new Date(reservationDate);
    expiryDate.setDate(expiryDate.getDate() + 1);

    const reservation = this.repository.create({
      readerId,
      bookId,
      copyId: availableCopies[0].id,
      reservationDate,
      expiryDate,
      status: ReservationStatus.PENDING,
    });

    await this.physicalCopyRepository.update(availableCopies[0].id, {
      status: PhysicalCopyStatus.RESERVED,
    });

    const savedReservation = await this.repository.save(reservation);

    this.reservationNotificationService.notifyAdmin({
      type: 'reservation_created',
      reservationId: savedReservation.id,
      readerId: savedReservation.readerId,
      bookId: savedReservation.bookId,
      message: `Có đặt trước mới từ độc giả ${reader.fullName}`,
    });

    return savedReservation;
  }

  async isAdminUser(userId: string): Promise<boolean> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'role'],
    });
    return user?.role === UserRole.ADMIN;
  }

  async resolveReaderIdForUser(userId: string): Promise<string> {
    const reader = await this.readerRepository.findOne({
      where: { userId },
      select: ['id'],
    });
    if (!reader) {
      throw new ForbiddenException(
        'Tài khoản chưa có hồ sơ độc giả hoặc không được phép thao tác này',
      );
    }
    return reader.id;
  }

  async findOneVisibleToUser(id: string, userId: string): Promise<Reservation> {
    const item = await this.findOne(id);
    if (await this.isAdminUser(userId)) {
      return item;
    }
    const reader = await this.readerRepository.findOne({
      where: { userId },
      select: ['id'],
    });
    if (!reader || item.readerId !== reader.id) {
      throw new ForbiddenException('Không có quyền xem đặt trước này');
    }
    return item;
  }

  private async resolvePhysicalCopyForReservationRelease(
    reservation: Pick<Reservation, 'copyId' | 'bookId'>,
  ): Promise<PhysicalCopy | null> {
    if (reservation.copyId) {
      return this.physicalCopyRepository.findOne({
        where: { id: reservation.copyId },
      });
    }
    return this.physicalCopyRepository.findOne({
      where: { book: { id: reservation.bookId } },
    });
  }

  async findAll(
    query: FilterReservationDto,
  ): Promise<PaginationDto<Reservation>> {
    const { page = 1, limit = 10, search, status } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.reader', 'reader')
      .leftJoinAndSelect('reader.user', 'user')
      .leftJoinAndSelect('entity.book', 'book');

    if (search && search.trim()) {
      qb.where('entity.status ILIKE :search', { search: `%${search.trim()}%` })
        .orWhere('user.fullName ILIKE :search', {
          search: `%${search.trim()}%`,
        })
        .orWhere('book.title ILIKE :search', { search: `%${search.trim()}%` });
    }

    if (status && String(status).trim()) {
      qb.andWhere('entity.status = :filterStatus', {
        filterStatus: String(status).trim(),
      });
    }

    qb.orderBy('entity.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
    return { data, meta };
  }

  async findAllByReader(
    readerId: string | undefined,
    query: FilterReservationDto,
  ): Promise<PaginationDto<Reservation>> {
    if (!readerId) {
      return this.findAll(query);
    }

    const { page = 1, limit = 10, status } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.book', 'book')
      .leftJoinAndSelect('book.mainCategory', 'mainCategory')
      .leftJoinAndSelect('book.publisher', 'publisher')
      .leftJoinAndSelect('entity.copy', 'copy')
      .leftJoinAndSelect('copy.location', 'location');

    qb.where('entity.reader_id = :readerId', { readerId });

    if (status && status.trim()) {
      qb.andWhere('entity.status = :status', { status });
    }

    qb.orderBy('entity.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, totalItems] = await qb.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit) || 1;
    const meta: PaginationMetaDto = {
      page,
      limit,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
    return { data, meta };
  }

  async findOne(id: string): Promise<Reservation> {
    const item = await this.repository.findOne({
      where: { id },
      relations: [
        'book',
        'book.mainCategory',
        'book.publisher',
        'copy',
        'copy.location',
      ],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateReservationDto,
  ): Promise<Reservation> {
    const item = await this.findOne(id);
    if (updateDto.readerId !== undefined) {
      const exists = await this.readerRepository.exist({
        where: { id: updateDto.readerId },
      });
      if (!exists) throw new BadRequestException('Độc giả không tồn tại');
    }
    if (updateDto.bookId !== undefined) {
      const exists = await this.bookRepository.exist({
        where: { id: updateDto.bookId },
      });
      if (!exists) throw new BadRequestException('Sách không tồn tại');
    }

    if (updateDto.status && updateDto.status !== item.status) {
      if (item.status !== ReservationStatus.PENDING) {
        throw new BadRequestException(
          'Chỉ có thể thay đổi trạng thái khi đặt trước đang chờ duyệt',
        );
      }

      if (updateDto.status === ReservationStatus.CANCELLED) {
        if (!updateDto.cancellationReason) {
          throw new BadRequestException(
            'Phải cung cấp lý do khi hủy đặt trước',
          );
        }

        const physicalCopy =
          await this.resolvePhysicalCopyForReservationRelease(item);
        if (physicalCopy) {
          await this.physicalCopyRepository.update(physicalCopy.id, {
            status: PhysicalCopyStatus.AVAILABLE,
          });
        }
      }
    }

    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Reservation>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);

    if (item.status === ReservationStatus.FULFILLED) {
      throw new BadRequestException(
        'Không thể xóa đặt trước đã được duyệt (fulfilled)',
      );
    }

    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }

  async cancelReservation(
    id: string,
    cancellationReason: string,
  ): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể hủy đặt trước khi đang ở trạng thái chờ duyệt',
      );
    }

    const physicalCopy =
      await this.resolvePhysicalCopyForReservationRelease(reservation);
    if (physicalCopy) {
      await this.physicalCopyRepository.update(physicalCopy.id, {
        status: PhysicalCopyStatus.AVAILABLE,
      });
    }

    reservation.status = ReservationStatus.CANCELLED;
    reservation.cancellationReason = cancellationReason;
    return this.repository.save(reservation);
  }

  async fulfillReservation(id: string): Promise<Reservation> {
    const reservation = await this.findOne(id);

    if (reservation.status !== ReservationStatus.PENDING) {
      throw new BadRequestException(
        'Chỉ có thể duyệt đặt trước khi đang ở trạng thái chờ duyệt',
      );
    }

    reservation.status = ReservationStatus.FULFILLED;
    return this.repository.save(reservation);
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async checkAndExpireReservations(): Promise<void> {
    const now = new Date();
    const expiredReservations = await this.repository.find({
      where: {
        status: ReservationStatus.PENDING,
      },
    });

    for (const reservation of expiredReservations) {
      if (new Date(reservation.expiryDate) < now) {
        reservation.status = ReservationStatus.EXPIRED;

        const physicalCopy =
          await this.resolvePhysicalCopyForReservationRelease(reservation);
        if (physicalCopy) {
          await this.physicalCopyRepository.update(physicalCopy.id, {
            status: PhysicalCopyStatus.AVAILABLE,
          });
        }

        await this.repository.save(reservation);
      }
    }
  }
}
