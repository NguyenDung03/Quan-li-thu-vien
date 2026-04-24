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
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { BorrowRecord } from './entities/borrow-record.entity';
import { CreateBorrowRecordDto } from './dto/create-borrow-record.dto';
import { UpdateBorrowRecordDto } from './dto/update-borrow-record.dto';
import { FilterBorrowRecordDto } from './dto/filter-borrow-record.dto';
import { Reader } from 'src/modules/user-modules/readers/entities/reader.entity';
import { PhysicalCopy } from 'src/modules/inventory-modules/physical-copies/entities/physical-copy.entity';
import { User } from 'src/modules/user-modules/users/entities/user.entity';
import { PhysicalCopyStatus } from 'src/common/enums/physical-copy-status.enum';
import { PhysicalCopyCondition } from 'src/common/enums/physical-copy-condition.enum';
import { BorrowRecordStatus } from 'src/common/enums/borrow-record-status.enum';
import { isPhysicalConditionWorseThanAtBorrow } from 'src/common/utils/physical-copy-condition.util';
import { Fine } from '../fines/entities/fine.entity';
import { FinePaymentMethod } from 'src/common/enums/fine-payment-method.enum';
import { FineStatus } from 'src/common/enums/fine-status.enum';
import { Book } from 'src/modules/catalog-modules/books/entities/book.entity';
import { PhysicalBookType } from 'src/common/enums/physical-book-type.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { EmailService } from 'src/common/services/email.service';
import { BorrowRecordNotificationService } from './borrow-record-notification.service';
import { SystemSettingsService } from 'src/modules/system-settings/system-settings.service';
import { ReturnBookDto } from './dto/return-book.dto';
import { MarkLostBookDto } from './dto/mark-lost-book.dto';
import { RenewOfflineDto } from './dto/renew-offline.dto';
import { physicalCopyFineReferencePrice } from 'src/common/utils/physical-copy-fine.util';
import {
  FINE_REASON_PREFIX_RENEWAL_FEE,
  isRenewalFeeFineReason,
} from 'src/common/utils/fine-renewal-fee.util';

@Injectable()
export class BorrowRecordsService {
  constructor(
    @InjectRepository(BorrowRecord)
    private readonly repository: Repository<BorrowRecord>,
    @InjectRepository(Reader)
    private readonly readerRepository: Repository<Reader>,
    @InjectRepository(PhysicalCopy)
    private readonly physicalCopyRepository: Repository<PhysicalCopy>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Fine)
    private readonly fineRepository: Repository<Fine>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly dataSource: DataSource,
    private readonly emailService: EmailService,
    private readonly borrowNotificationService: BorrowRecordNotificationService,
    private readonly systemSettings: SystemSettingsService,
  ) {}

  async create(createDto: CreateBorrowRecordDto): Promise<BorrowRecord> {
    const reader = await this.readerRepository.findOne({
      where: { id: createDto.readerId },
      relations: ['readerType', 'user'],
    });
    if (!reader) throw new BadRequestException('Độc giả không tồn tại');

    const physicalCopy = await this.physicalCopyRepository.findOne({
      where: { id: createDto.copyId },
      relations: ['book'],
    });
    if (!physicalCopy) throw new BadRequestException('Bản sao không tồn tại');

    const librarian = await this.userRepository.findOne({
      where: { id: createDto.librarianId },
    });
    if (!librarian) throw new BadRequestException('Thủ thư không tồn tại');

    if (
      physicalCopy.status !== PhysicalCopyStatus.AVAILABLE &&
      physicalCopy.status !== PhysicalCopyStatus.RESERVED
    ) {
      throw new BadRequestException('Bản sao không có sẵn để mượn');
    }

    if (physicalCopy.book.physicalType === PhysicalBookType.LIBRARY_USE) {
      throw new BadRequestException(
        'Sách này chỉ đọc tại thư viện, không cho mượn về',
      );
    }

    const borrowDurationDays = reader.readerType?.borrowDurationDays ?? 14;
    const borrowDate = new Date(createDto.borrowDate);
    if (Number.isNaN(borrowDate.getTime())) {
      throw new BadRequestException('Ngày mượn không hợp lệ');
    }
    const dueDate = new Date(borrowDate);
    dueDate.setDate(dueDate.getDate() + borrowDurationDays);

    const item = this.repository.create({
      readerId: createDto.readerId,
      copyId: createDto.copyId,
      librarianId: createDto.librarianId,
      borrowDate,
      dueDate,
      status: BorrowRecordStatus.BORROWED,
      isRenewed: false,
      conditionAtBorrow: physicalCopy.currentCondition,
      book: physicalCopy.book,
    });

    await this.physicalCopyRepository.update(physicalCopy.id, {
      status: PhysicalCopyStatus.BORROWED,
    });

    const savedRecord = await this.repository.save(item);

    if (reader.user?.email) {
      try {
        await this.emailService.sendBorrowRecordCreatedEmail({
          email: reader.user.email,
          fullName: reader.fullName,
          bookTitle: physicalCopy.book?.title,
          borrowDate,
          dueDate,
        });
      } catch (error) {
        console.error(
          'Failed to send borrow record email notification:',
          error,
        );
      }
    }

    this.borrowNotificationService.notify(reader.id, {
      type: 'borrow_record_created',
      borrowRecordId: savedRecord.id,
      readerId: reader.id,
      message: `Bạn vừa được tạo phiếu mượn cho sách "${physicalCopy.book?.title || 'Không xác định'}".`,
      bookTitle: physicalCopy.book?.title,
      dueDate: dueDate.toISOString(),
    });

    return savedRecord;
  }

  async findReaderByUserId(userId: string): Promise<Reader | null> {
    return this.readerRepository.findOne({
      where: { userId },
    });
  }

  async findAll(
    query: FilterBorrowRecordDto,
  ): Promise<PaginationDto<BorrowRecord>> {
    const { page = 1, limit = 10, search, readerId, status } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.book', 'book')
      .leftJoinAndSelect('entity.reader', 'reader')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .leftJoinAndSelect('entity.librarian', 'librarian')
      .leftJoinAndSelect('entity.copy', 'physicalCopy')
      .leftJoinAndSelect('physicalCopy.book', 'copyBook')
      .leftJoinAndSelect('physicalCopy.location', 'location');

    if (search && search.trim()) {
      qb.andWhere(
        '(reader.fullName ILIKE :search OR reader.cardNumber ILIKE :search OR book.title ILIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    if (readerId) {
      qb.andWhere('entity.readerId = :readerId', { readerId });
    }

    if (status) {
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

  async findAllByReader(
    readerId: string,
    query: FilterBorrowRecordDto,
  ): Promise<PaginationDto<BorrowRecord>> {
    const { page = 1, limit = 10, status } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.book', 'book')
      .leftJoinAndSelect('entity.reader', 'reader')
      .leftJoinAndSelect('reader.readerType', 'readerType')
      .leftJoinAndSelect('entity.librarian', 'librarian')
      .leftJoinAndSelect('entity.copy', 'physicalCopy')
      .leftJoinAndSelect('physicalCopy.book', 'copyBook')
      .leftJoinAndSelect('physicalCopy.location', 'location')
      .where('entity.readerId = :readerId', { readerId });

    if (status) {
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

  async findOne(id: string): Promise<BorrowRecord> {
    const item = await this.repository.findOne({
      where: { id },
      relations: [
        'reader',
        'reader.readerType',
        'librarian',
        'book',
        'copy',
        'copy.book',
        'copy.location',
      ],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(
    id: string,
    updateDto: UpdateBorrowRecordDto,
  ): Promise<BorrowRecord> {
    const item = await this.findOne(id);

    if (updateDto.readerId !== undefined) {
      const exists = await this.readerRepository.exist({
        where: { id: updateDto.readerId },
      });
      if (!exists) throw new BadRequestException('Độc giả không tồn tại');
    }

    if (updateDto.copyId !== undefined) {
      const exists = await this.physicalCopyRepository.exist({
        where: { id: updateDto.copyId },
      });
      if (!exists) throw new BadRequestException('Bản sao không tồn tại');
    }

    if (updateDto.librarianId !== undefined) {
      const exists = await this.userRepository.exist({
        where: { id: updateDto.librarianId },
      });
      if (!exists) throw new BadRequestException('Thủ thư không tồn tại');
    }

    if (updateDto.status !== undefined) {
      const oldStatus = item.status;
      const newStatus = updateDto.status;

      if (
        newStatus === BorrowRecordStatus.RETURNED &&
        oldStatus === BorrowRecordStatus.RETURNED
      ) {
        throw new BadRequestException('Sách đã được trả trước đó');
      }

      if (
        (newStatus === BorrowRecordStatus.BORROWED ||
          newStatus === BorrowRecordStatus.RENEWED) &&
        oldStatus === BorrowRecordStatus.RETURNED
      ) {
        throw new BadRequestException(
          'Sách đã được trả, không thể chuyển sang trạng thái mượn',
        );
      }
    }

    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (updateDto.status !== undefined) {
        const oldStatus = item.status;
        const newStatus = updateDto.status;

        if (
          newStatus === BorrowRecordStatus.RETURNED &&
          oldStatus !== BorrowRecordStatus.RETURNED
        ) {
          await queryRunner.manager.update(PhysicalCopy, item.copyId, {
            status: PhysicalCopyStatus.AVAILABLE,
          });
        }

        if (
          (newStatus === BorrowRecordStatus.BORROWED ||
            newStatus === BorrowRecordStatus.RENEWED) &&
          oldStatus !== BorrowRecordStatus.BORROWED &&
          oldStatus !== BorrowRecordStatus.RENEWED
        ) {
          await queryRunner.manager.update(PhysicalCopy, item.copyId, {
            status: PhysicalCopyStatus.BORROWED,
          });
        }
      }

      const merged = this.repository.merge(
        item,
        updateDto as unknown as Partial<BorrowRecord>,
      );
      const result = await queryRunner.manager.save(BorrowRecord, merged);

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }

  private isUnpaidOverdueFineReason(reason: string): boolean {
    const t = reason.trim();
    if (t.toLowerCase().startsWith('mất sách')) {
      return false;
    }
    return t.includes('Trả sách quá hạn') || t.includes('Quá hạn trả sách');
  }

  private async ensureUnpaidOverdueFineIfMissingAfterLost(
    borrowId: string,
    dueDate: Date,
    asOfDate: Date,
  ): Promise<void> {
    if (asOfDate.getTime() <= dueDate.getTime()) {
      return;
    }
    const daysOverdue = Math.ceil(
      (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (daysOverdue <= 0) {
      return;
    }
    const perDay = await this.systemSettings.getOverdueFeePerDay();
    const fineAmount = daysOverdue * perDay;
    if (fineAmount <= 0) {
      return;
    }

    const unpaid = await this.fineRepository.find({
      where: { borrowId, status: FineStatus.UNPAID },
    });
    const hasOverdue = unpaid.some((f) =>
      this.isUnpaidOverdueFineReason(f.reason),
    );
    if (hasOverdue) {
      return;
    }

    await this.fineRepository.save(
      this.fineRepository.create({
        borrowId,
        fineAmount,
        fineDate: asOfDate,
        reason: `Quá hạn trả sách ${daysOverdue} ngày`,
        status: FineStatus.UNPAID,
      }),
    );
  }

  private async upsertUnpaidOverdueFineForBorrow(
    borrowId: string,
    dueDate: Date,
    asOfDate: Date,
  ): Promise<void> {
    if (asOfDate.getTime() <= dueDate.getTime()) {
      return;
    }
    const daysOverdue = Math.ceil(
      (asOfDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    const perDay = await this.systemSettings.getOverdueFeePerDay();
    const fineAmount = daysOverdue * perDay;
    if (fineAmount <= 0) {
      return;
    }

    const unpaid = await this.fineRepository.find({
      where: { borrowId, status: FineStatus.UNPAID },
    });
    const existing = unpaid.find((f) =>
      this.isUnpaidOverdueFineReason(f.reason),
    );

    const reason = `Quá hạn trả sách ${daysOverdue} ngày`;

    if (existing) {
      const prev = Math.round(Number(existing.fineAmount));
      const next = Math.round(fineAmount);
      if (prev !== next) {
        existing.fineAmount = fineAmount;
        existing.fineDate = asOfDate;
        existing.reason = reason;
        await this.fineRepository.save(existing);
      }
    } else {
      await this.fineRepository.save(
        this.fineRepository.create({
          borrowId,
          fineAmount,
          fineDate: asOfDate,
          reason,
          status: FineStatus.UNPAID,
        }),
      );
    }
  }

  async returnBook(id: string, dto: ReturnBookDto): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status === BorrowRecordStatus.RETURNED) {
      throw new BadRequestException('Sách đã được trả trước đó');
    }
    if (borrowRecord.status === BorrowRecordStatus.LOST) {
      throw new BadRequestException('Phiếu đã xử lý mất sách');
    }

    const librarianExists = await this.userRepository.exist({
      where: { id: dto.librarianId },
    });
    if (!librarianExists) {
      throw new BadRequestException('Thủ thư không tồn tại');
    }

    const copy = await this.physicalCopyRepository.findOne({
      where: { id: borrowRecord.copyId },
      relations: ['book'],
    });
    if (!copy) {
      throw new BadRequestException('Bản sao không tồn tại');
    }

    let receivedCondition = copy.currentCondition;
    if (dto.receivedCondition !== undefined) {
      receivedCondition = dto.receivedCondition;
      await this.physicalCopyRepository.update(copy.id, {
        currentCondition: dto.receivedCondition,
        ...(dto.conditionDetails !== undefined
          ? { conditionDetails: dto.conditionDetails }
          : {}),
      });
    }

    const returnDate = new Date();
    const isOverdue = returnDate > borrowRecord.dueDate;

    borrowRecord.returnDate = returnDate;
    borrowRecord.status = isOverdue
      ? BorrowRecordStatus.OVERDUE
      : BorrowRecordStatus.RETURNED;

    await this.physicalCopyRepository.update(borrowRecord.copyId, {
      status: PhysicalCopyStatus.AVAILABLE,
    });

    const atBorrow =
      borrowRecord.conditionAtBorrow ?? PhysicalCopyCondition.GOOD;

    if (isPhysicalConditionWorseThanAtBorrow(receivedCondition, atBorrow)) {
      const damagedAmount =
        await this.systemSettings.computeDamagedBookFineAmount(
          physicalCopyFineReferencePrice(copy),
        );
      if (damagedAmount > 0) {
        const damagedFine = this.fineRepository.create({
          borrowId: id,
          fineAmount: damagedAmount,
          fineDate: returnDate,
          reason: `Làm hỏng / xuống cấp so với lúc mượn `,
          status: FineStatus.UNPAID,
        });
        await this.fineRepository.save(damagedFine);
      }
    }

    if (isOverdue) {
      const daysOverdue = Math.ceil(
        (returnDate.getTime() - borrowRecord.dueDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );
      const perDay = await this.systemSettings.getOverdueFeePerDay();
      const fineAmount = daysOverdue * perDay;

      const fine = this.fineRepository.create({
        borrowId: id,
        fineAmount,
        fineDate: returnDate,
        reason: `Trả sách quá hạn ${daysOverdue} ngày`,
        status: FineStatus.UNPAID,
      });

      await this.fineRepository.save(fine);
    }

    return this.repository.save(borrowRecord);
  }

  async markBookAsLost(
    id: string,
    dto: MarkLostBookDto,
  ): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(id);

    if (borrowRecord.status === BorrowRecordStatus.RETURNED) {
      throw new BadRequestException('Sách đã được trả, không áp dụng mất sách');
    }
    if (borrowRecord.status === BorrowRecordStatus.LOST) {
      throw new BadRequestException('Phiếu đã được đánh dấu mất sách');
    }

    const librarianExists = await this.userRepository.exist({
      where: { id: dto.librarianId },
    });
    if (!librarianExists) {
      throw new BadRequestException('Thủ thư không tồn tại');
    }

    const copy = await this.physicalCopyRepository.findOne({
      where: { id: borrowRecord.copyId },
      relations: ['book'],
    });
    if (!copy) {
      throw new BadRequestException('Bản sao không tồn tại');
    }

    const now = new Date();

    await this.upsertUnpaidOverdueFineForBorrow(id, borrowRecord.dueDate, now);

    const lostAmount = await this.systemSettings.computeLostBookFineAmount(
      physicalCopyFineReferencePrice(copy),
    );

    const lostFine = this.fineRepository.create({
      borrowId: id,
      fineAmount: lostAmount,
      fineDate: now,
      reason: 'Mất sách (báo mất hoặc xử lý thủ công)',
      status: FineStatus.UNPAID,
    });
    await this.fineRepository.save(lostFine);

    borrowRecord.status = BorrowRecordStatus.LOST;
    borrowRecord.returnDate = now;

    await this.physicalCopyRepository.update(copy.id, {
      status: PhysicalCopyStatus.LOST,
    });

    await this.ensureUnpaidOverdueFineIfMissingAfterLost(
      id,
      borrowRecord.dueDate,
      now,
    );

    return this.repository.save(borrowRecord);
  }

  async createRenewalFeeFineForPayOs(
    borrowId: string,
    requesterUserId: string,
  ): Promise<{ fineId: string }> {
    const borrowRecord = await this.findOne(borrowId);
    await this.assertUserCanAccessBorrowForRenewalPayment(
      borrowRecord,
      requesterUserId,
    );

    if (borrowRecord.status === BorrowRecordStatus.RETURNED) {
      throw new BadRequestException('Sách đã được trả, không thể gia hạn');
    }
    if (borrowRecord.status === BorrowRecordStatus.LOST) {
      throw new BadRequestException(
        'Phiếu đã xử lý mất sách, không thể gia hạn',
      );
    }
    if (borrowRecord.isRenewed) {
      throw new BadRequestException('Sách đã được gia hạn trước đó');
    }

    const amount = await this.systemSettings.getRenewalFeeAmount();
    if (amount <= 0) {
      throw new BadRequestException(
        'Chưa cấu hình phí gia hạn (renewalFeeAmount trong cài đặt phạt)',
      );
    }

    const fines = await this.fineRepository.find({ where: { borrowId } });
    const renewalFine = fines.find((f) => isRenewalFeeFineReason(f.reason));

    if (renewalFine) {
      if (renewalFine.status === FineStatus.PAID) {
        throw new BadRequestException(
          'Phí gia hạn đã thanh toán; nếu chưa thấy ngày mới, liên hệ thủ thư',
        );
      }
      if (
        renewalFine.status === FineStatus.UNPAID ||
        renewalFine.status === FineStatus.PENDING
      ) {
        return { fineId: renewalFine.id };
      }
    }

    const fine = this.fineRepository.create({
      borrowId,
      fineAmount: amount,
      fineDate: new Date(),
      reason: `${FINE_REASON_PREFIX_RENEWAL_FEE} Gia han phieu ${borrowId}`,
      status: FineStatus.UNPAID,
    });
    const saved = await this.fineRepository.save(fine);
    return { fineId: saved.id };
  }

  private async assertUserCanAccessBorrowForRenewalPayment(
    borrowRecord: BorrowRecord,
    requesterUserId: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: requesterUserId },
      select: ['id', 'role'],
    });
    if (!user) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }
    if (user.role === UserRole.ADMIN) {
      return;
    }
    if (borrowRecord.reader?.userId !== requesterUserId) {
      throw new ForbiddenException(
        'Chỉ độc giả sở hữu phiếu hoặc admin mới khởi tạo thanh toán gia hạn',
      );
    }
  }

  async renewBookAtCounter(
    id: string,
    adminUserId: string,
    dto: RenewOfflineDto,
  ): Promise<BorrowRecord> {
    const defaultAmount = await this.systemSettings.getRenewalFeeAmount();
    const amount =
      dto.fineAmount !== undefined ? Number(dto.fineAmount) : defaultAmount;
    if (!Number.isFinite(amount) || amount < 0) {
      throw new BadRequestException('Số tiền không hợp lệ');
    }

    const collectedBy = dto.collectedBy?.trim() || adminUserId;
    const staffExists = await this.userRepository.exist({
      where: { id: collectedBy },
    });
    if (!staffExists) {
      throw new BadRequestException('collectedBy không tồn tại trong hệ thống');
    }

    return this.dataSource.transaction(async (manager) => {
      const borrowRepo = manager.getRepository(BorrowRecord);
      const fineRepo = manager.getRepository(Fine);

      const borrowRecord = await borrowRepo
        .createQueryBuilder('br')
        .setLock('pessimistic_write')
        .innerJoinAndSelect('br.reader', 'reader')
        .innerJoinAndSelect('reader.readerType', 'readerType')
        .innerJoinAndSelect('br.librarian', 'librarian')
        .innerJoinAndSelect('br.copy', 'copy')
        .innerJoinAndSelect('copy.book', 'copyBook')
        .innerJoinAndSelect('copy.location', 'copyLocation')
        .where('br.id = :id', { id })
        .getOne();

      if (!borrowRecord) {
        throw new NotFoundException('Không tìm thấy dữ liệu');
      }

      const slipWithBook = await borrowRepo.findOne({
        where: { id },
        relations: ['book'],
      });
      if (slipWithBook?.book) {
        borrowRecord.book = slipWithBook.book;
      }

      if (borrowRecord.status === BorrowRecordStatus.RETURNED) {
        throw new BadRequestException('Sách đã được trả, không thể gia hạn');
      }
      if (borrowRecord.status === BorrowRecordStatus.LOST) {
        throw new BadRequestException(
          'Phiếu đã xử lý mất sách, không thể gia hạn',
        );
      }

      const fines = await fineRepo.find({ where: { borrowId: id } });
      const renewalFine = fines.find((f) => isRenewalFeeFineReason(f.reason));

      if (renewalFine?.status === FineStatus.PENDING) {
        throw new BadRequestException(
          'Đang có giao dịch PayOS gia hạn chờ thanh toán; không ghi nhận tiền mặt.',
        );
      }

      if (borrowRecord.isRenewed) {
        throw new BadRequestException(
          'Sách đã được gia hạn trước đó, không thể gia hạn thêm',
        );
      }

      const extraDays = borrowRecord.reader?.readerType?.borrowDurationDays;
      if (
        extraDays == null ||
        !Number.isFinite(Number(extraDays)) ||
        Math.floor(Number(extraDays)) < 1
      ) {
        throw new BadRequestException(
          'Loại độc giả chưa cấu hình thời gian mượn (ngày) hợp lệ',
        );
      }

      const now = new Date();

      if (renewalFine?.status === FineStatus.PAID) {
        const newDueDate = new Date(borrowRecord.dueDate);
        newDueDate.setDate(
          newDueDate.getDate() + Math.floor(Number(extraDays)),
        );
        borrowRecord.dueDate = newDueDate;
        borrowRecord.status = BorrowRecordStatus.RENEWED;
        borrowRecord.isRenewed = true;
        return borrowRepo.save(borrowRecord);
      }

      if (renewalFine?.status === FineStatus.UNPAID) {
        renewalFine.status = FineStatus.PAID;
        renewalFine.paymentDate = now;
        renewalFine.paymentMethod = FinePaymentMethod.CASH;
        renewalFine.collectedBy = collectedBy;
        renewalFine.fineAmount = amount;
        await fineRepo.save(renewalFine);
      } else if (amount > 0) {
        const fine = fineRepo.create({
          borrowId: id,
          fineAmount: amount,
          fineDate: now,
          reason: `${FINE_REASON_PREFIX_RENEWAL_FEE} Gia han tai quay phieu ${id}`,
          status: FineStatus.PAID,
          paymentDate: now,
          paymentMethod: FinePaymentMethod.CASH,
          collectedBy,
        });
        await fineRepo.save(fine);
      }

      const newDueDate = new Date(borrowRecord.dueDate);
      newDueDate.setDate(newDueDate.getDate() + Math.floor(Number(extraDays)));
      borrowRecord.dueDate = newDueDate;
      borrowRecord.status = BorrowRecordStatus.RENEWED;
      borrowRecord.isRenewed = true;

      return borrowRepo.save(borrowRecord);
    });
  }

  async applyRenewalAfterRenewalFeePaid(
    borrowId: string,
  ): Promise<BorrowRecord> {
    const borrowRecord = await this.findOne(borrowId);

    if (borrowRecord.isRenewed) {
      return borrowRecord;
    }

    if (borrowRecord.status === BorrowRecordStatus.RETURNED) {
      throw new BadRequestException(
        'Sách đã trả, không thể áp dụng gia hạn sau thanh toán',
      );
    }
    if (borrowRecord.status === BorrowRecordStatus.LOST) {
      throw new BadRequestException(
        'Phiếu mất sách, không thể áp dụng gia hạn sau thanh toán',
      );
    }

    const extraDays = borrowRecord.reader?.readerType?.borrowDurationDays;
    if (
      extraDays == null ||
      !Number.isFinite(Number(extraDays)) ||
      Math.floor(Number(extraDays)) < 1
    ) {
      throw new BadRequestException(
        'Loại độc giả chưa cấu hình thời gian mượn (ngày) hợp lệ',
      );
    }

    const newDueDate = new Date(borrowRecord.dueDate);
    newDueDate.setDate(newDueDate.getDate() + Math.floor(Number(extraDays)));

    borrowRecord.dueDate = newDueDate;
    borrowRecord.status = BorrowRecordStatus.RENEWED;
    borrowRecord.isRenewed = true;

    return this.repository.save(borrowRecord);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduledOverdueAndLostCheck(): Promise<void> {
    await this.checkAndUpdateOverdueRecords();
  }

  async runOverdueCheckNow(): Promise<{ message: string }> {
    await this.checkAndUpdateOverdueRecords();
    return { message: 'Đã chạy kiểm tra quá hạn / mất sách.' };
  }

  async checkAndUpdateOverdueRecords(): Promise<void> {
    const now = new Date();
    const lostDayThreshold =
      await this.systemSettings.getLostBookOverdueDaysAsLost();

    const activeRecords = await this.repository.find({
      where: [
        { status: BorrowRecordStatus.BORROWED },
        { status: BorrowRecordStatus.RENEWED },
        { status: BorrowRecordStatus.OVERDUE },
      ],
      relations: ['copy'],
    });

    for (const record of activeRecords) {
      if (now <= record.dueDate) {
        continue;
      }

      const daysOverdue = Math.ceil(
        (now.getTime() - record.dueDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (daysOverdue >= lostDayThreshold) {
        if (record.status === BorrowRecordStatus.LOST) {
          continue;
        }

        const copy =
          record.copy ??
          (await this.physicalCopyRepository.findOne({
            where: { id: record.copyId },
            relations: ['book'],
          }));
        if (!copy) {
          continue;
        }

        await this.upsertUnpaidOverdueFineForBorrow(
          record.id,
          record.dueDate,
          now,
        );

        const lostAmount = await this.systemSettings.computeLostBookFineAmount(
          physicalCopyFineReferencePrice(copy),
        );

        const lostFine = this.fineRepository.create({
          borrowId: record.id,
          fineAmount: lostAmount,
          fineDate: now,
          reason: `Mất sách / quá hạn từ ${lostDayThreshold} ngày (tự động)`,
          status: FineStatus.UNPAID,
        });
        await this.fineRepository.save(lostFine);

        await this.ensureUnpaidOverdueFineIfMissingAfterLost(
          record.id,
          record.dueDate,
          now,
        );

        record.status = BorrowRecordStatus.LOST;
        record.returnDate = now;
        await this.repository.save(record);

        await this.physicalCopyRepository.update(record.copyId, {
          status: PhysicalCopyStatus.LOST,
        });
        continue;
      }

      if (
        record.status === BorrowRecordStatus.BORROWED ||
        record.status === BorrowRecordStatus.RENEWED
      ) {
        record.status = BorrowRecordStatus.OVERDUE;
        await this.repository.save(record);

        const perDay = await this.systemSettings.getOverdueFeePerDay();
        const fineAmount = daysOverdue * perDay;

        const fine = this.fineRepository.create({
          borrowId: record.id,
          fineAmount,
          fineDate: now,
          reason: `Quá hạn trả sách ${daysOverdue} ngày`,
          status: FineStatus.UNPAID,
        });

        await this.fineRepository.save(fine);
      }
    }
  }
}
