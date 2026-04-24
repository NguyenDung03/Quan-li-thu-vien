import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { Reservation, ReservationStatusType } from '@/types/reservation.types'

interface ReservationsTableProps {
  data: Reservation[]
  meta?: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  loading?: boolean
  noDataText?: string
  currentPage: number
  limit: number
  onPageChange: (page: number) => void
  onEdit: (item: Reservation) => void
  onDelete: (item: Reservation) => void
}

export function ReservationsTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: ReservationsTableProps) {
  const { t } = useTranslation('common')

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: ReservationStatusType) => {
    const statusConfig: Record<
      ReservationStatusType,
      { label: string; className: string }
    > = {
      pending: {
        label: t('reservations.statusPending'),
        className:
          'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      },
      fulfilled: {
        label: t('reservations.statusFulfilled'),
        className:
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      },
      cancelled: {
        label: t('reservations.statusCancelled'),
        className:
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      },
      expired: {
        label: t('reservations.statusExpired'),
        className:
          'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400',
      },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
      >
        {config.label}
      </span>
    )
  }

  const columns: Column<Reservation>[] = [
    {
      key: 'readerId',
      header: t('reservations.readerId'),
      render: (item: Reservation) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm">
             {item.reader?.user?.fullName || item.reader?.fullName || 'N/A'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {item.reader?.cardNumber || item.readerId.slice(0, 8) + '...'}
          </span>
        </div>
      ),
    },
    {
      key: 'bookId',
      header: t('reservations.bookId'),
      render: (item: Reservation) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm truncate max-w-[200px]" title={item.book?.title}>
            {item.book?.title || 'N/A'}
          </span>
          <span className="text-xs text-slate-500 font-mono">
            {item.book?.isbn || item.bookId.slice(0, 8) + '...'}
          </span>
        </div>
      ),
    },
    {
      key: 'reservationDate',
      header: t('reservations.reservationDate'),
      render: (item: Reservation) => formatDate(item.reservationDate),
    },
    {
      key: 'expiryDate',
      header: t('reservations.expiryDate'),
      render: (item: Reservation) => formatDate(item.expiryDate),
    },
    {
      key: 'status',
      header: t('reservations.status'),
      render: (item: Reservation) => getStatusBadge(item.status),
    },
    {
      key: 'cancellationReason',
      header: t('reservations.cancellationReason'),
      render: (item: Reservation) => (
        <span className="text-sm text-slate-500 truncate max-w-[150px] block">
          {item.cancellationReason || '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Reservation) => (
        <ActionButtons
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ),
    },
  ]

  return (
    <DataTable
      columns={columns}
      data={data}
      meta={meta}
      loading={loading}
      noDataText={noDataText}
      currentPage={currentPage}
      limit={limit}
      onPageChange={onPageChange}
    />
  )
}
