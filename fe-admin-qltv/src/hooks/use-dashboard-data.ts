import { useQueries, useQuery } from '@tanstack/react-query'
import { bookApi } from '@/apis/book.api'
import { readerApi } from '@/apis/reader.api'
import { borrowRecordApi } from '@/apis/borrow-record.api'
import { reservationApi } from '@/apis/reservation.api'
import { dashboardSummaryApi } from '@/apis/dashboard-summary.api'
import { ReservationStatus } from '@/types/reservation.types'

export const dashboardQueryKeys = {
  all: ['admin-dashboard'] as const,
  stats: () => [...dashboardQueryKeys.all, 'stats'] as const,
  recentBorrows: () => [...dashboardQueryKeys.all, 'recent-borrows'] as const,
  newBooks: () => [...dashboardQueryKeys.all, 'new-books'] as const,
  summary: (days: number) => [...dashboardQueryKeys.all, 'summary', days] as const,
}

export function useDashboardStats() {
  const results = useQueries({
    queries: [
      {
        queryKey: [...dashboardQueryKeys.stats(), 'books'],
        queryFn: () => bookApi.getBooks({ page: 1, limit: 1 }),
      },
      {
        queryKey: [...dashboardQueryKeys.stats(), 'readers'],
        queryFn: () => readerApi.getReaders({ page: 1, limit: 1 }),
      },
      {
        queryKey: [...dashboardQueryKeys.stats(), 'overdue'],
        queryFn: () =>
          borrowRecordApi.getBorrowRecords({ page: 1, limit: 1, status: 'overdue' }),
      },
      {
        queryKey: [...dashboardQueryKeys.stats(), 'reservations-pending'],
        queryFn: () =>
          reservationApi.getReservations({
            page: 1,
            limit: 1,
            status: ReservationStatus.PENDING,
          }),
      },
      {
        queryKey: [...dashboardQueryKeys.stats(), 'borrow-total'],
        queryFn: () => borrowRecordApi.getBorrowRecords({ page: 1, limit: 1 }),
      },
    ],
  })

  const loading = results.some((r) => r.isPending)

  return {
    bookTitles: results[0]?.data?.meta.totalItems ?? 0,
    readers: results[1]?.data?.meta.totalItems ?? 0,
    overdue: results[2]?.data?.meta.totalItems ?? 0,
    reservationsPending: results[3]?.data?.meta.totalItems ?? 0,
    borrowRecordsTotal: results[4]?.data?.meta.totalItems ?? 0,
    loading,
  }
}

export function useDashboardRecentBorrows() {
  return useQuery({
    queryKey: dashboardQueryKeys.recentBorrows(),
    queryFn: () => borrowRecordApi.getBorrowRecords({ page: 1, limit: 8 }),
    staleTime: 60_000,
  })
}

export function useDashboardNewBooks() {
  return useQuery({
    queryKey: dashboardQueryKeys.newBooks(),
    queryFn: () => bookApi.getBooks({ page: 1, limit: 5 }),
    staleTime: 60_000,
  })
}

const SUMMARY_DAYS = 30

export function useDashboardSummary() {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(SUMMARY_DAYS),
    queryFn: () => dashboardSummaryApi.getSummary({ days: SUMMARY_DAYS }),
    staleTime: 60_000,
  })
}
