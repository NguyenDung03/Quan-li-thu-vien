import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { Author } from '@/types/author.types'
import { countries } from '@/data/countries'

interface AuthorsTableProps {
  data: Author[]
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
  onEdit: (author: Author) => void
  onDelete: (author: Author) => void
}

export function AuthorsTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: AuthorsTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<Author>[] = [
    {
      key: 'authorName',
      header: t('authors.name'),
      render: (item: Author) => <span className="font-medium">{item.authorName}</span>,
    },
    {
      key: 'bio',
      header: t('authors.bio'),
      render: (item: Author) => item.bio || '-',
      className: 'max-w-xs truncate',
    },
    {
      key: 'nationality',
      header: t('authors.nationality') || 'Quốc tịch',
      render: (item: Author) =>
        item.nationality
          ? countries.find((c) => c.value === item.nationality)?.label ||
            item.nationality
          : '-',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Author) => (
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
