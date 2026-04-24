import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DEFAULT_DAMAGED_BOOK_FINE_FIXED,
  DEFAULT_DAMAGED_BOOK_FINE_PERCENT,
  DEFAULT_LOST_BOOK_FINE_MODE,
  DEFAULT_LOST_BOOK_OVERDUE_DAYS_AS_LOST,
  DEFAULT_LOST_BOOK_PROCESSING_FEE,
  DEFAULT_LOST_BOOK_REIMBURSE_PERCENT,
  DEFAULT_OVERDUE_FEE_PER_DAY,
  DEFAULT_RENEWAL_FEE_AMOUNT,
  FINE_SETTING_KEYS,
} from 'src/common/constants/fine-setting-keys';
import { Repository } from 'typeorm';
import { SystemSetting } from './entities/system-setting.entity';

export type DamagedBookFineMode = 'fixed' | 'percent';
export type LostBookFineMode = 'fixed' | 'percent';

@Injectable()
export class SystemSettingsService {
  constructor(
    @InjectRepository(SystemSetting)
    private readonly repository: Repository<SystemSetting>,
  ) {}

  async getValue(settingKey: string): Promise<string | null> {
    const row = await this.repository.findOne({ where: { settingKey } });
    return row?.settingValue ?? null;
  }

  async getNumeric(settingKey: string, fallback: number): Promise<number> {
    const raw = await this.getValue(settingKey);
    if (raw == null || raw.trim() === '') return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }

  async upsert(
    settingKey: string,
    settingValue: string,
  ): Promise<SystemSetting> {
    let row = await this.repository.findOne({ where: { settingKey } });
    if (row) {
      row.settingValue = settingValue;
    } else {
      row = this.repository.create({ settingKey, settingValue });
    }
    return this.repository.save(row);
  }

  async getOverdueFeePerDay(): Promise<number> {
    return this.getNumeric(
      FINE_SETTING_KEYS.OVERDUE_FEE_PER_DAY,
      DEFAULT_OVERDUE_FEE_PER_DAY,
    );
  }

  async getDamagedBookFineMode(): Promise<DamagedBookFineMode> {
    const raw = (
      await this.getValue(FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_MODE)
    )?.toLowerCase();
    return raw === 'percent' ? 'percent' : 'fixed';
  }

  async getDamagedBookFineFixed(): Promise<number> {
    return this.getNumeric(
      FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_FIXED,
      DEFAULT_DAMAGED_BOOK_FINE_FIXED,
    );
  }

  async getDamagedBookFinePercent(): Promise<number> {
    return this.getNumeric(
      FINE_SETTING_KEYS.DAMAGED_BOOK_FINE_PERCENT,
      DEFAULT_DAMAGED_BOOK_FINE_PERCENT,
    );
  }

  async getLostBookFineMode(): Promise<LostBookFineMode> {
    const raw = (
      await this.getValue(FINE_SETTING_KEYS.LOST_BOOK_FINE_MODE)
    )?.toLowerCase();
    if (raw === 'fixed') return 'fixed';
    if (raw === 'percent') return 'percent';
    return DEFAULT_LOST_BOOK_FINE_MODE;
  }

  async getLostBookReimbursePercent(): Promise<number> {
    return this.getNumeric(
      FINE_SETTING_KEYS.LOST_BOOK_REIMBURSE_PERCENT,
      DEFAULT_LOST_BOOK_REIMBURSE_PERCENT,
    );
  }

  async getLostBookProcessingFee(): Promise<number> {
    return this.getNumeric(
      FINE_SETTING_KEYS.LOST_BOOK_PROCESSING_FEE,
      DEFAULT_LOST_BOOK_PROCESSING_FEE,
    );
  }

  async getRenewalFeeAmount(): Promise<number> {
    const n = await this.getNumeric(
      FINE_SETTING_KEYS.RENEWAL_FEE_AMOUNT,
      DEFAULT_RENEWAL_FEE_AMOUNT,
    );
    return Math.max(0, Math.round(n));
  }

  async getLostBookOverdueDaysAsLost(): Promise<number> {
    const n = await this.getNumeric(
      FINE_SETTING_KEYS.LOST_BOOK_OVERDUE_DAYS_AS_LOST,
      DEFAULT_LOST_BOOK_OVERDUE_DAYS_AS_LOST,
    );
    return Math.max(1, Math.floor(n));
  }

  async computeDamagedBookFineAmount(
    purchasePrice?: number | null,
  ): Promise<number> {
    const mode = await this.getDamagedBookFineMode();
    const fixedAmt = await this.getDamagedBookFineFixed();
    const pct = await this.getDamagedBookFinePercent();
    const price = purchasePrice != null ? Number(purchasePrice) : 0;
    if (mode === 'percent') {
      if (!Number.isFinite(price) || price <= 0) {
        return Math.round(fixedAmt);
      }
      return Math.round((price * pct) / 100);
    }
    return Math.round(fixedAmt);
  }

  async computeLostBookFineAmount(
    purchasePrice?: number | null,
  ): Promise<number> {
    const mode = await this.getLostBookFineMode();
    const fee = await this.getLostBookProcessingFee();
    if (mode === 'fixed') {
      return Math.round(fee);
    }
    const reimbursePct = await this.getLostBookReimbursePercent();
    const price = purchasePrice != null ? Number(purchasePrice) : 0;
    const reimbursement =
      Number.isFinite(price) && price > 0 ? (price * reimbursePct) / 100 : 0;
    return Math.round(reimbursement);
  }
}
