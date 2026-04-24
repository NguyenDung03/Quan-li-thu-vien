import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  PaginationDto,
  PaginationMetaDto,
} from 'src/common/dto/pagination-query.dto';
import { FINE_SETTING_KEYS } from 'src/common/constants/fine-setting-keys';
import { SystemSettingsService } from 'src/modules/system-settings/system-settings.service';
import { EntityManager, Repository } from 'typeorm';
import { Fine } from './entities/fine.entity';
import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';
import { FilterFineDto } from './dto/filter-fine.dto';
import { FineRulesResponseDto, UpdateFineRulesDto } from './dto/fine-rules.dto';
import { BorrowRecord } from 'src/modules/transaction-modules/borrow-records/entities/borrow-record.entity';
import { FinePaymentMethod } from 'src/common/enums/fine-payment-method.enum';
import { FineStatus } from 'src/common/enums/fine-status.enum';
import { isRenewalFeeFineReason } from 'src/common/utils/fine-renewal-fee.util';
import { BorrowRecordsService } from 'src/modules/transaction-modules/borrow-records/borrow-records.service';

@Injectable()
export class FinesService {
  private readonly logger = new Logger(FinesService.name);

  constructor(
    @InjectRepository(Fine)
    private readonly repository: Repository<Fine>,
    @InjectRepository(BorrowRecord)
    private readonly borrowRecordRepository: Repository<BorrowRecord>,
    private readonly systemSettings: SystemSettingsService,
    private readonly borrowRecordsService: BorrowRecordsService,
  ) {}

  async getFineRules(): Promise<FineRulesResponseDto> {
    const [
      overdueFeePerDay,
      damagedBookFineMode,
      damagedBookFineFixed,
      damagedBookFinePercent,
      lostBookFineMode,
      lostBookReimbursePercent,
      lostBookProcessingFee,
      lostBookOverdueDaysAsLost,
      renewalFeeAmount,
    ] = await Promise.all([
      this.systemSettings.getOverdueFeePerDay(),
      this.systemSettings.getDamagedBookFineMode(),
      this.systemSettings.getDamagedBookFineFixed(),
      this.systemSettings.getDamagedBookFinePercent(),
      this.systemSettings.getLostBookFineMode(),
      this.systemSettings.getLostBookReimbursePercent(),
      this.systemSettings.getLostBookProcessingFee(),
      this.systemSettings.getLostBookOverdueDaysAsLost(),
      this.systemSettings.getRenewalFeeAmount(),
    ]);
    return {
      overdueFeePerDay,
      damagedBookFineMode,
      damagedBookFineFixed,
      damagedBookFinePercent,
      lostBookFineMode,
      lostBookReimbursePercent,
      lostBookProcessingFee,
      lostBookOverdueDaysAsLost,
      renewalFeeAmount,
    };
  }

  async updateFineRules(
    dto: UpdateFineRulesDto,
  ): Promise<FineRulesResponseDto> {
    await Promise.all([
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.OVERDUE_FEE_PER_DAY,
        String(dto.overdueFeePerDay),
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_MODE,
        dto.damagedBookFineMode,
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_FIXED,
        String(dto.damagedBookFineFixed),
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_PERCENT,
        String(dto.damagedBookFinePercent),
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.LOST_BOOK_FINE_MODE,
        dto.lostBookFineMode,
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.LOST_BOOK_REIMBURSE_PERCENT,
        String(dto.lostBookReimbursePercent),
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.LOST_BOOK_PROCESSING_FEE,
        String(dto.lostBookProcessingFee),
      ),
      this.systemSettings.upsert(
        FINE_SETTING_KEYS.LOST_BOOK_OVERDUE_DAYS_AS_LOST,
        String(dto.lostBookOverdueDaysAsLost),
      ),
    ]);
    if (dto.renewalFeeAmount !== undefined) {
      await this.systemSettings.upsert(
        FINE_SETTING_KEYS.RENEWAL_FEE_AMOUNT,
        String(dto.renewalFeeAmount),
      );
    }
    return this.getFineRules();
  }

  async findFineReasonById(
    id: string,
  ): Promise<{ id: string; reason: string }> {
    const row = await this.repository.findOne({
      where: { id },
      select: ['id', 'reason'],
    });
    if (!row) {
      throw new NotFoundException('Không tìm thấy khoản phạt');
    }
    return { id: row.id, reason: row.reason };
  }

  async assertFinePayableByBorrowerUser(
    fineId: string,
    userId: string,
  ): Promise<void> {
    const fine = await this.repository.findOne({
      where: { id: fineId },
      relations: ['borrow', 'borrow.reader'],
    });
    if (!fine) {
      throw new NotFoundException('Không tìm thấy khoản phạt');
    }
    const ownerUserId = fine.borrow?.reader?.userId;
    if (!ownerUserId || ownerUserId !== userId) {
      throw new ForbiddenException('Không có quyền thanh toán khoản phạt này');
    }
  }

  async create(createDto: CreateFineDto): Promise<Fine> {
    if (createDto.borrowId) {
      const exists = await this.borrowRecordRepository.exist({
        where: { id: createDto.borrowId },
      });
      if (!exists) throw new BadRequestException('Phiếu mượn không tồn tại');
    }
    const item = this.repository.create(createDto as unknown as Partial<Fine>);
    return this.repository.save(item);
  }

  async findAll(query: FilterFineDto): Promise<PaginationDto<Fine>> {
    const { page = 1, limit = 10, search } = query;
    const qb = this.repository
      .createQueryBuilder('entity')
      .leftJoinAndSelect('entity.borrow', 'borrow')
      .leftJoinAndSelect('borrow.reader', 'reader')
      .leftJoinAndSelect('borrow.copy', 'copy')
      .leftJoinAndSelect('copy.book', 'copyBook')
      .leftJoinAndSelect('copy.location', 'copyLocation');

    if (search && search.trim()) {
      qb.andWhere(
        'entity.status ILIKE :search OR entity.reason ILIKE :search OR reader.fullName ILIKE :search',
        { search: `%${search.trim()}%` },
      );
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

  async findOne(id: string): Promise<Fine> {
    const item = await this.repository.findOne({
      where: { id },
      relations: [
        'borrow',
        'borrow.reader',
        'borrow.copy',
        'borrow.copy.book',
        'borrow.copy.location',
      ],
    });
    if (!item) throw new NotFoundException('Không tìm thấy dữ liệu');
    return item;
  }

  async update(id: string, updateDto: UpdateFineDto): Promise<Fine> {
    const item = await this.findOne(id);
    if (updateDto.borrowId !== undefined) {
      const exists = await this.borrowRecordRepository.exist({
        where: { id: updateDto.borrowId },
      });
      if (!exists) throw new BadRequestException('Phiếu mượn không tồn tại');
    }
    const merged = this.repository.merge(
      item,
      updateDto as unknown as Partial<Fine>,
    );
    return this.repository.save(merged);
  }

  async remove(id: string): Promise<{ message: string }> {
    const item = await this.findOne(id);
    await this.repository.remove(item);
    return { message: 'Xóa dữ liệu thành công' };
  }

  async payFine(id: string): Promise<Fine> {
    const fine = await this.findOne(id);

    if (fine.status === FineStatus.PAID) {
      throw new BadRequestException('Tiền phạt đã được thanh toán trước đó');
    }

    fine.status = FineStatus.PAID;
    fine.paymentDate = new Date();

    return this.repository.save(fine);
  }

  async getUnpaidFinesByReader(readerId: string): Promise<Fine[]> {
    return this.repository.find({
      where: {
        borrow: { reader: { id: readerId } },
        status: FineStatus.UNPAID,
      },
      relations: ['borrow'],
    });
  }

  async reservePayOsPaymentSession(fineId: string): Promise<{
    fine: Fine;
    orderCode: number;
    hasStoredCheckout: boolean;
  }> {
    return this.repository.manager.transaction(async (em) => {
      const repo = em.getRepository(Fine);
      const fine = await repo.findOne({
        where: { id: fineId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!fine) {
        throw new NotFoundException('Không tìm thấy khoản phạt');
      }
      if (fine.status === FineStatus.PAID) {
        throw new BadRequestException('Khoản phạt đã được thanh toán');
      }
      if (fine.status === FineStatus.CANCELLED) {
        throw new BadRequestException(
          'Khoản phạt đã hủy, không thể thanh toán',
        );
      }
      if (fine.status === FineStatus.PENDING && fine.paymentCode == null) {
        throw new BadRequestException(
          'Dữ liệu thanh toán PayOS không nhất quán (thiếu payment_code)',
        );
      }
      if (fine.status === FineStatus.PENDING && fine.paymentCode != null) {
        return {
          fine,
          orderCode: fine.paymentCode,
          hasStoredCheckout: !!fine.payosCheckoutUrl,
        };
      }
      if (fine.status !== FineStatus.UNPAID) {
        throw new BadRequestException(
          'Trạng thái khoản phạt không cho phép tạo thanh toán PayOS',
        );
      }
      const orderCode = await this.allocatePayOsOrderCode(em);
      fine.paymentCode = orderCode;
      fine.status = FineStatus.PENDING;
      fine.paymentMethod = FinePaymentMethod.PAYOS;
      await repo.save(fine);
      return {
        fine,
        orderCode,
        hasStoredCheckout: false,
      };
    });
  }

  async savePayOsCheckoutUrl(
    fineId: string,
    checkoutUrl: string,
  ): Promise<void> {
    await this.repository.update(
      { id: fineId },
      { payosCheckoutUrl: checkoutUrl },
    );
  }

  async markAsPaidByPayOsWebhook(
    orderCode: number,
    paidAmount: number,
  ): Promise<{ updated: boolean }> {
    const fine = await this.repository.findOne({
      where: { paymentCode: orderCode },
    });
    if (!fine) {
      return { updated: false };
    }
    if (fine.status === FineStatus.PAID) {
      await this.applyRenewalIfRenewalFeeFine(fine);
      return { updated: true };
    }
    const expected = Number(fine.fineAmount);
    if (Number.isFinite(paidAmount) && Math.abs(expected - paidAmount) > 0.5) {
      throw new BadRequestException('Số tiền webhook không khớp khoản phạt');
    }
    if (
      fine.status !== FineStatus.PENDING &&
      fine.status !== FineStatus.UNPAID
    ) {
      throw new BadRequestException(
        'Trạng thái khoản phạt không hợp lệ để xác nhận thanh toán',
      );
    }
    fine.status = FineStatus.PAID;
    fine.paymentDate = new Date();
    fine.paymentMethod = FinePaymentMethod.PAYOS;
    await this.repository.save(fine);
    await this.applyRenewalIfRenewalFeeFine(fine);
    return { updated: true };
  }

  private async applyRenewalIfRenewalFeeFine(fine: Fine): Promise<void> {
    if (!isRenewalFeeFineReason(fine.reason)) {
      return;
    }
    try {
      await this.borrowRecordsService.applyRenewalAfterRenewalFeePaid(
        fine.borrowId,
      );
    } catch (err) {
      this.logger.error(
        `Hậu thanh toán phí gia hạn thất bại borrowId=${fine.borrowId}: ${String(err)}`,
      );
      throw err;
    }
  }

  private buildTimestampPayOsOrderCode(): number {
    const tsPart = Date.now() % 1_000_000;
    const rand = Math.floor(Math.random() * 1_000);
    return tsPart * 1_000 + rand;
  }

  private async allocatePayOsOrderCode(em: EntityManager): Promise<number> {
    const repo = em.getRepository(Fine);
    for (let i = 0; i < 15; i++) {
      const candidate = this.buildTimestampPayOsOrderCode();
      const clash = await repo.findOne({
        where: { paymentCode: candidate },
        select: ['id'],
      });
      if (!clash) {
        return candidate;
      }
    }
    try {
      const rows = await em.query(
        `SELECT nextval('fines_payment_code_seq') AS "nextval"`,
      );
      return Number(rows[0].nextval);
    } catch {
      throw new BadRequestException(
        'Không sinh được mã thanh toán PayOS duy nhất; thử lại sau',
      );
    }
  }
}
