import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { Publisher } from '@/types/publisher.types'

interface PublishersTableProps {
  data: Publisher[]
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
  onEdit: (publisher: Publisher) => void
  onDelete: (publisher: Publisher) => void
}

export function PublishersTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: PublishersTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<Publisher>[] = [
    {
      key: 'publisherName',
      header: t('publishers.name'),
      render: (item: Publisher) => <span className="font-medium">{item.publisherName}</span>,
    },
    {
      key: 'address',
      header: t('publishers.address'),
      render: (item: Publisher) => item.address || '-',
      className: 'max-w-xs truncate',
    },
    {
      key: 'phone',
      header: t('publishers.phone'),
      render: (item: Publisher) => item.phone || '-',
    },
    {
      key: 'email',
      header: t('publishers.email'),
      render: (item: Publisher) => item.email || '-',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Publisher) => (
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