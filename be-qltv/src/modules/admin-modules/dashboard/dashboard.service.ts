import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BorrowRecordStatus } from 'src/common/enums/borrow-record-status.enum';
import { BookType } from 'src/common/enums/book-type.enum';
import { FineStatus } from 'src/common/enums/fine-status.enum';
import { ReservationStatus } from 'src/common/enums/reservation-status.enum';
import {
  DashboardActivityDayDto,
  DashboardDateRangeDto,
  DashboardKpisDto,
  DashboardSummaryResponseDto,
  NamedCountDto,
} from './dto/dashboard-summary-response.dto';

const BORROW_STATUS_ORDER: BorrowRecordStatus[] = [
  BorrowRecordStatus.BORROWED,
  BorrowRecordStatus.RENEWED,
  BorrowRecordStatus.OVERDUE,
  BorrowRecordStatus.RETURNED,
  BorrowRecordStatus.LOST,
];

const BORROW_STATUS_LABEL: Record<BorrowRecordStatus, string> = {
  [BorrowRecordStatus.BORROWED]: 'Đang mượn',
  [BorrowRecordStatus.RENEWED]: 'Đã gia hạn',
  [BorrowRecordStatus.OVERDUE]: 'Quá hạn',
  [BorrowRecordStatus.RETURNED]: 'Đã trả',
  [BorrowRecordStatus.LOST]: 'Mất sách',
};

const BOOK_TYPE_LABEL: Record<BookType, string> = {
  [BookType.EBOOK]: 'Sách điện tử',
  [BookType.PHYSICAL]: 'Sách vật lý',
};

const FINE_STATUS_ORDER: FineStatus[] = [
  FineStatus.PENDING,
  FineStatus.UNPAID,
  FineStatus.PAID,
  FineStatus.CANCELLED,
];

const FINE_STATUS_LABEL: Record<FineStatus, string> = {
  [FineStatus.PENDING]: 'Chờ xử lý',
  [FineStatus.UNPAID]: 'Chưa thanh toán',
  [FineStatus.PAID]: 'Đã thanh toán',
  [FineStatus.CANCELLED]: 'Đã hủy',
};

const RESERVATION_STATUS_ORDER: ReservationStatus[] = [
  ReservationStatus.PENDING,
  ReservationStatus.FULFILLED,
  ReservationStatus.CANCELLED,
  ReservationStatus.EXPIRED,
];

const RESERVATION_STATUS_LABEL: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Đang chờ',
  [ReservationStatus.FULFILLED]: 'Đã xử lý',
  [ReservationStatus.CANCELLED]: 'Đã hủy',
  [ReservationStatus.EXPIRED]: 'Hết hạn',
};

function utcDayRange(days: number): {
  range: DashboardDateRangeDto;
  start: Date;
  endExclusive: Date;
} {
  const endExclusive = new Date();
  endExclusive.setUTCHours(0, 0, 0, 0);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  const start = new Date(endExclusive);
  start.setUTCDate(start.getUTCDate() - days);

  const toYmd = (d: Date) => d.toISOString().slice(0, 10);
  const lastInclusive = new Date(endExclusive);
  lastInclusive.setUTCDate(lastInclusive.getUTCDate() - 1);

  return {
    range: {
      from: toYmd(start),
      to: toYmd(lastInclusive),
      days,
    },
    start,
    endExclusive,
  };
}

function enumerateUtcDays(from: Date, endExclusive: Date): string[] {
  const out: string[] = [];
  const d = new Date(from);
  while (d < endExclusive) {
    out.push(d.toISOString().slice(0, 10));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return out;
}

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getSummary(daysInput?: number): Promise<DashboardSummaryResponseDto> {
    const days = Math.min(366, Math.max(1, daysInput ?? 30));
    const { range, start, endExclusive } = utcDayRange(days);

    const [
      borrowByStatusRows,
      booksByTypeRows,
      finesByStatusRows,
      reservationsByStatusRows,
      borrowDayRows,
      returnDayRows,
      fineDayRows,
      kpiRow,
    ] = await Promise.all([
      this.dataSource.query<
        { status: string; count: string | number }[]
      >(
        `SELECT status::text AS status, COUNT(*)::int AS count
         FROM borrow_records GROUP BY status`,
      ),
      this.dataSource.query<{ book_type: string; count: string | number }[]>(
        `SELECT book_type::text AS book_type, COUNT(*)::int AS count
         FROM books GROUP BY book_type`,
      ),
      this.dataSource.query<{ status: string; count: string | number }[]>(
        `SELECT status::text AS status, COUNT(*)::int AS count
         FROM fines GROUP BY status`,
      ),
      this.dataSource.query<{ status: string; count: string | number }[]>(
        `SELECT status::text AS status, COUNT(*)::int AS count
         FROM reservations GROUP BY status`,
      ),
      this.dataSource.query<{ day: string; count: string | number }[]>(
        `SELECT (borrow_date AT TIME ZONE 'UTC')::date::text AS day, COUNT(*)::int AS count
         FROM borrow_records
         WHERE borrow_date >= $1 AND borrow_date < $2
         GROUP BY 1 ORDER BY 1`,
        [start, endExclusive],
      ),
      this.dataSource.query<{ day: string; count: string | number }[]>(
        `SELECT (return_date AT TIME ZONE 'UTC')::date::text AS day, COUNT(*)::int AS count
         FROM borrow_records
         WHERE return_date IS NOT NULL
           AND return_date >= $1 AND return_date < $2
         GROUP BY 1 ORDER BY 1`,
        [start, endExclusive],
      ),
      this.dataSource.query<
        { day: string; count: string | number; amount: string | number }[]
      >(
        `SELECT (fine_date AT TIME ZONE 'UTC')::date::text AS day,
                COUNT(*)::int AS count,
                COALESCE(SUM(fine_amount), 0)::float8 AS amount
         FROM fines
         WHERE fine_date >= $1 AND fine_date < $2
         GROUP BY 1 ORDER BY 1`,
        [start, endExclusive],
      ),
      this.dataSource.query<
        {
          total_books: string | number;
          total_readers: string | number;
          active_borrows: string | number;
          overdue: string | number;
          lost: string | number;
          unpaid_fines_count: string | number;
          unpaid_fines_amount: string | number;
        }[]
      >(
        `SELECT
           (SELECT COUNT(*)::int FROM books) AS total_books,
           (SELECT COUNT(*)::int FROM readers) AS total_readers,
           (SELECT COUNT(*)::int FROM borrow_records
             WHERE status IN ('borrowed','renewed','overdue')) AS active_borrows,
           (SELECT COUNT(*)::int FROM borrow_records WHERE status = 'overdue') AS overdue,
           (SELECT COUNT(*)::int FROM borrow_records WHERE status = 'lost') AS lost,
           (SELECT COUNT(*)::int FROM fines WHERE status IN ('pending','unpaid')) AS unpaid_fines_count,
           (SELECT COALESCE(SUM(fine_amount), 0)::float8 FROM fines WHERE status IN ('pending','unpaid')) AS unpaid_fines_amount`,
      ),
    ]);

    const borrowCountMap = new Map(
      borrowByStatusRows.map((r) => [r.status, Number(r.count)]),
    );
    const borrowRecordsByStatus: NamedCountDto[] = BORROW_STATUS_ORDER.map(
      (key) => ({
        key,
        label: BORROW_STATUS_LABEL[key],
        count: borrowCountMap.get(key) ?? 0,
      }),
    );

    const bookTypeMap = new Map(
      booksByTypeRows.map((r) => [r.book_type, Number(r.count)]),
    );
    const booksByType: NamedCountDto[] = [BookType.PHYSICAL, BookType.EBOOK].map(
      (key) => ({
        key,
        label: BOOK_TYPE_LABEL[key],
        count: bookTypeMap.get(key) ?? 0,
      }),
    );

    const fineStatusMap = new Map(
      finesByStatusRows.map((r) => [r.status, Number(r.count)]),
    );
    const finesByStatus: NamedCountDto[] = FINE_STATUS_ORDER.map((key) => ({
      key,
      label: FINE_STATUS_LABEL[key],
      count: fineStatusMap.get(key) ?? 0,
    }));

    const reservationMap = new Map(
      reservationsByStatusRows.map((r) => [r.status, Number(r.count)]),
    );
    const reservationsByStatus: NamedCountDto[] =
      RESERVATION_STATUS_ORDER.map((key) => ({
        key,
        label: RESERVATION_STATUS_LABEL[key],
        count: reservationMap.get(key) ?? 0,
      }));

    const borrowPerDay = new Map(
      borrowDayRows.map((r) => [r.day, Number(r.count)]),
    );
    const returnPerDay = new Map(
      returnDayRows.map((r) => [r.day, Number(r.count)]),
    );
    const fineCountPerDay = new Map(
      fineDayRows.map((r) => [r.day, Number(r.count)]),
    );
    const fineAmountPerDay = new Map(
      fineDayRows.map((r) => [r.day, Number(r.amount)]),
    );

    const dayKeys = enumerateUtcDays(start, endExclusive);
    const activityByDay: DashboardActivityDayDto[] = dayKeys.map((date) => ({
      date,
      borrows: borrowPerDay.get(date) ?? 0,
      returns: returnPerDay.get(date) ?? 0,
      finesIssued: fineCountPerDay.get(date) ?? 0,
      finesAmount: fineAmountPerDay.get(date) ?? 0,
    }));

    const k = kpiRow[0] ?? {
      total_books: 0,
      total_readers: 0,
      active_borrows: 0,
      overdue: 0,
      lost: 0,
      unpaid_fines_count: 0,
      unpaid_fines_amount: 0,
    };

    const kpis: DashboardKpisDto = {
      totalBooks: Number(k.total_books),
      totalReaders: Number(k.total_readers),
      activeBorrowRecords: Number(k.active_borrows),
      overdueBorrowRecords: Number(k.overdue),
      lostBorrowRecords: Number(k.lost),
      unpaidFinesCount: Number(k.unpaid_fines_count),
      unpaidFinesTotalAmount: Number(k.unpaid_fines_amount),
    };

    return {
      generatedAt: new Date().toISOString(),
      range,
      kpis,
      borrowRecordsByStatus,
      booksByType,
      finesByStatus,
      reservationsByStatus,
      activityByDay,
    };
  }
}
