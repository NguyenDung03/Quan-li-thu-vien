import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { ReaderType } from '@/types/reader-type.types'

interface ReaderTypesTableProps {
  data: ReaderType[]
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
  onEdit: (item: ReaderType) => void
  onDelete: (item: ReaderType) => void
}

export function ReaderTypesTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: ReaderTypesTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<ReaderType>[] = [
    {
      key: 'typeName',
      header: t('readerTypes.typeName'),
      render: (item: ReaderType) => <span className="font-medium">{item.typeName}</span>,
    },
    {
      key: 'maxBorrowLimit',
      header: t('readerTypes.maxBorrowLimit'),
      render: (item: ReaderType) => item.maxBorrowLimit,
    },
    {
      key: 'borrowDurationDays',
      header: t('readerTypes.borrowDurationDays'),
      render: (item: ReaderType) => item.borrowDurationDays,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: ReaderType) => (
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
