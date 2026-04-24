import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { BorrowRecord, BorrowRecordStatusType } from '@/types/borrow-record.types'

interface BorrowRecordsTableProps {
  data: BorrowRecord[]
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
  onEdit: (record: BorrowRecord) => void
  onDelete: (record: BorrowRecord) => void
}

function normalizeBorrowRecordStatus(raw: string): BorrowRecordStatusType {
  const s = (raw ?? '').toLowerCase()
  if (
    s === 'borrowed' ||
    s === 'returned' ||
    s === 'overdue' ||
    s === 'renewed' ||
    s === 'lost'
  ) {
    return s as BorrowRecordStatusType
  }
  return 'borrowed'
}

const getStatusLabel = (status: BorrowRecordStatusType, t: (key: string) => string): string => {
  const statusMap: Record<BorrowRecordStatusType, string> = {
    borrowed: t('statusBorrowed'),
    returned: t('statusReturned'),
    overdue: t('statusOverdue'),
    renewed: t('statusRenewed'),
    lost: t('statusLost'),
  }
  return statusMap[status] ?? status
}

const getStatusColor = (status: BorrowRecordStatusType): string => {
  const colorMap: Record<BorrowRecordStatusType, string> = {
    borrowed:
      'bg-sky-100 text-sky-900 ring-1 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-800',
    returned:
      'bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800',
    overdue:
      'bg-rose-100 text-rose-900 ring-1 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800',
    renewed:
      'bg-amber-100 text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800',
    lost:
      'bg-violet-100 text-violet-900 ring-1 ring-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:ring-violet-800',
  }
  return (
    colorMap[status] ??
    'bg-slate-100 text-slate-800 ring-1 ring-slate-200 dark:bg-slate-800/50 dark:text-slate-300'
  )
}

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

export function BorrowRecordsTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: BorrowRecordsTableProps) {
  const { t } = useTranslation('borrowRecord')

  const columns: Column<BorrowRecord>[] = [
    {
      key: 'reader',
      header: t('reader'),
      render: (item: BorrowRecord) => (
        <div>
          <div className="font-medium">{item.reader?.fullName || '-'}</div>
          <div className="text-xs text-slate-500">{item.reader?.cardNumber || '-'}</div>
        </div>
      ),
    },
    {
      key: 'book',
      header: t('book'),
      render: (item: BorrowRecord) => {
        const copy = item.copy
        const book = copy?.book || item.book
        return (
          <div>
            <div className="font-medium">{book?.title || '-'}</div>
            <div className="text-xs text-slate-500 space-y-0.5">
              <div>{t('barcode')}: {copy?.barcode || '-'}</div>
              <div>{t('location')}: {copy?.location?.name || '-'}</div>
              {copy?.conditionDetails && (
                <div>{t('condition')}: {copy.conditionDetails}</div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      key: 'borrowDate',
      header: t('borrowDate'),
      render: (item: BorrowRecord) => formatDate(item.borrowDate),
    },
    {
      key: 'dueDate',
      header: t('dueDate'),
      render: (item: BorrowRecord) => formatDate(item.dueDate),
    },
    {
      key: 'returnDate',
      header: t('returnDate'),
      render: (item: BorrowRecord) => formatDate(item.returnDate),
    },
    {
      key: 'status',
      header: t('status'),
      render: (item: BorrowRecord) => {
        const st = normalizeBorrowRecordStatus(String(item.status))
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(
              st,
            )}`}
          >
            {getStatusLabel(st, t)}
          </span>
        )
      },
    },
    {
      key: 'isRenewed',
      header: t('renewed'),
      render: (item: BorrowRecord) => (
        <span className="text-xs">{item.isRenewed ? t('yes') : t('no')}</span>
      ),
    },
    {
      key: 'actions',
      header: t('actions'),
      render: (item: BorrowRecord) => (
        <div className="flex items-center justify-end gap-1">
          <ActionButtons
            onEdit={() => onEdit(item)}
            onDelete={() => onDelete(item)}
          />
        </div>
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
