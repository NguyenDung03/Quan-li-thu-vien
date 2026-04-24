import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { Reader } from '@/types/reader.types'

interface ReadersTableProps {
  data: Reader[]
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
  onEdit: (reader: Reader) => void
  onDelete: (reader: Reader) => void
  getReaderTypeName: (readerTypeId: string) => string
}

export function ReadersTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  getReaderTypeName,
}: ReadersTableProps) {
  const { t } = useTranslation('reader')

  const columns: Column<Reader>[] = [
    {
      key: 'fullName',
      header: t('fullName'),
      render: (item: Reader) => <span className="font-medium">{item.fullName}</span>,
    },
    {
      key: 'cardNumber',
      header: t('cardNumber'),
      render: (item: Reader) => <span className="font-mono text-sm">{item.cardNumber}</span>,
    },
    {
      key: 'readerType',
      header: t('readerType'),
      render: (item: Reader) => getReaderTypeName(item.readerTypeId),
    },
    {
      key: 'dob',
      header: t('dob'),
      render: (item: Reader) => item.dob,
    },
    {
      key: 'gender',
      header: t('gender'),
      render: (item: Reader) => t(item.gender),
    },
    {
      key: 'phone',
      header: t('phone'),
      render: (item: Reader) => item.phone,
    },
    {
      key: 'isActive',
      header: t('isActive'),
      render: (item: Reader) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {item.isActive ? t('active') : t('inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('edit'),
      render: (item: Reader) => (
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
