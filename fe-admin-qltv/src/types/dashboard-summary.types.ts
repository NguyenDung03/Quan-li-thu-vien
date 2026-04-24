/** Khớp `GET /api/admin/dashboard-summary` (Nest) */

export interface DashboardDateRange {
  from: string
  to: string
  days: number
}

export interface DashboardKpis {
  totalBooks: number
  totalReaders: number
  activeBorrowRecords: number
  overdueBorrowRecords: number
  lostBorrowRecords: number
  unpaidFinesCount: number
  unpaidFinesTotalAmount: number
}

export interface DashboardNamedCount {
  key: string
  label: string
  count: number
}

export interface DashboardActivityDay {
  date: string
  borrows: number
  returns: number
  finesIssued: number
  finesAmount: number
}

export interface DashboardSummaryResponse {
  generatedAt: string
  range: DashboardDateRange
  kpis: DashboardKpis
  borrowRecordsByStatus: DashboardNamedCount[]
  booksByType: DashboardNamedCount[]
  finesByStatus: DashboardNamedCount[]
  reservationsByStatus: DashboardNamedCount[]
  activityByDay: DashboardActivityDay[]
}
