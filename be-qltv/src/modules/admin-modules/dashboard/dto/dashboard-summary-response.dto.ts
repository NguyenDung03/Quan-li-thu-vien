import { ApiProperty } from '@nestjs/swagger';

export class DashboardDateRangeDto {
  @ApiProperty({ example: '2026-03-24', description: 'YYYY-MM-DD (UTC), bao gồm' })
  from: string;

  @ApiProperty({ example: '2026-04-22', description: 'YYYY-MM-DD (UTC), bao gồm' })
  to: string;

  @ApiProperty({ example: 30 })
  days: number;
}

export class DashboardKpisDto {
  @ApiProperty()
  totalBooks: number;

  @ApiProperty()
  totalReaders: number;

  @ApiProperty({
    description:
      'Số phiếu trạng thái borrowed, renewed hoặc overdue (đang trong vòng mượn)',
  })
  activeBorrowRecords: number;

  @ApiProperty()
  overdueBorrowRecords: number;

  @ApiProperty()
  lostBorrowRecords: number;

  @ApiProperty({
    description: 'Số phiếu phạt chưa thanh toán (pending + unpaid)',
  })
  unpaidFinesCount: number;

  @ApiProperty({ description: 'Tổng tiền phạt chưa thanh toán (VND)' })
  unpaidFinesTotalAmount: number;
}

export class NamedCountDto {
  @ApiProperty({ description: 'Mã nội bộ (enum / key)' })
  key: string;

  @ApiProperty({ description: 'Nhãn hiển thị (tiếng Việt)' })
  label: string;

  @ApiProperty()
  count: number;
}

export class DashboardActivityDayDto {
  @ApiProperty({ example: '2026-04-01' })
  date: string;

  @ApiProperty({ description: 'Số phiếu có borrow_date trong ngày (UTC)' })
  borrows: number;

  @ApiProperty({
    description: 'Số phiếu có return_date trong ngày (UTC), return_date khác null',
  })
  returns: number;

  @ApiProperty({ description: 'Số phiếu phạt có fine_date trong ngày (UTC)' })
  finesIssued: number;

  @ApiProperty({ description: 'Tổng fine_amount phát hành trong ngày (UTC)' })
  finesAmount: number;
}

export class DashboardSummaryResponseDto {
  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: DashboardDateRangeDto })
  range: DashboardDateRangeDto;

  @ApiProperty({ type: DashboardKpisDto })
  kpis: DashboardKpisDto;

  @ApiProperty({
    type: [NamedCountDto],
    description: 'Phân bổ phiếu mượn theo trạng thái (Recharts: Bar / Pie)',
  })
  borrowRecordsByStatus: NamedCountDto[];

  @ApiProperty({
    type: [NamedCountDto],
    description: 'Phân bổ đầu mục sách theo book_type (Recharts: Pie)',
  })
  booksByType: NamedCountDto[];

  @ApiProperty({
    type: [NamedCountDto],
    description: 'Phân bổ phiếu phạt theo status (Recharts: Pie / Bar)',
  })
  finesByStatus: NamedCountDto[];

  @ApiProperty({
    type: [NamedCountDto],
    description: 'Phân bổ đặt trước theo status (Recharts: Pie / Bar)',
  })
  reservationsByStatus: NamedCountDto[];

  @ApiProperty({
    type: [DashboardActivityDayDto],
    description:
      'Chuỗi theo ngày UTC, đủ mọi ngày trong range (ngày không có sự kiện = 0) — Recharts Line / ComposedChart',
  })
  activityByDay: DashboardActivityDayDto[];
}
