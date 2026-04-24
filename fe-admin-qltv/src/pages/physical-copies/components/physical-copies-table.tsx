import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import { BookCoverCell, getBookCoverUrl } from '@/components/book-cover-cell'
import type { PhysicalCopy, PhysicalCopyStatus } from '@/types/physical-copy.types'
import { MapPin, Barcode } from 'lucide-react'

interface PhysicalCopiesTableProps {
  data: PhysicalCopy[]
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
  onEdit: (item: PhysicalCopy) => void
  onDelete: (item: PhysicalCopy) => void
}

export function PhysicalCopiesTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: PhysicalCopiesTableProps) {
  const { t } = useTranslation('common')

  const getStatusBadge = (status: PhysicalCopyStatus) => {
    const statusConfig: Record<PhysicalCopyStatus, { label: string; className: string }> = {
      available: { label: t('physicalCopies.available'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      borrowed: { label: t('physicalCopies.borrowed'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      reserved: { label: t('physicalCopies.reserved'), className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      damaged: { label: t('physicalCopies.damaged'), className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
      lost: { label: t('physicalCopies.lost'), className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
      maintenance: { label: t('physicalCopies.maintenance'), className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400' },
    }
    const config = statusConfig[status]
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const getConditionBadge = (condition: string) => {
    const conditionConfig: Record<string, { label: string; className: string }> = {
      new: { label: t('physicalCopies.conditionNew'), className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
      good: { label: t('physicalCopies.conditionGood'), className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
      worn: { label: t('physicalCopies.conditionWorn'), className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
      damaged: { label: t('physicalCopies.conditionDamaged'), className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
    }
    const config = conditionConfig[condition] || { label: condition, className: 'bg-slate-100 text-slate-800' }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    )
  }

  const columns: Column<PhysicalCopy>[] = [
    {
      key: 'coverImage',
      header: t('books.coverImage'),
      className: 'w-20 shrink-0',
      render: (item: PhysicalCopy) => (
        <BookCoverCell
          url={getBookCoverUrl(item.book)}
          alt={item.book?.title}
        />
      ),
    },
    {
      key: 'barcode',
      header: t('physicalCopies.barcode'),
      render: (item: PhysicalCopy) => (
        <div className="flex items-center gap-2">
          <Barcode className="h-4 w-4 text-slate-400" />
          <span className="font-mono font-medium">{item.barcode}</span>
        </div>
      ),
    },
    {
      key: 'book',
      header: t('physicalCopies.book'),
      className: 'min-w-0',
      render: (item: PhysicalCopy) => (
        <span className="font-medium">{item.book?.title || '-'}</span>
      ),
    },
    {
      key: 'status',
      header: t('physicalCopies.status'),
      render: (item: PhysicalCopy) => getStatusBadge(item.status),
    },
    {
      key: 'currentCondition',
      header: t('physicalCopies.condition'),
      render: (item: PhysicalCopy) => getConditionBadge(item.currentCondition),
    },
    {
      key: 'location',
      header: t('physicalCopies.location'),
      render: (item: PhysicalCopy) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>{item.location?.name || '-'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: PhysicalCopy) => (
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