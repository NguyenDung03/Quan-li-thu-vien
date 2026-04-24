import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { BookCategory } from '@/types/book-category.types'

interface BookCategoriesTableProps {
  data: BookCategory[]
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
  onEdit: (category: BookCategory) => void
  onDelete: (category: BookCategory) => void
  getParentName: (parentId?: string) => string
}

export function BookCategoriesTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  getParentName,
}: BookCategoriesTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<BookCategory>[] = [
    {
      key: 'name',
      header: t('bookCategories.name'),
      render: (item: BookCategory) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'parentId',
      header: t('bookCategories.parentId'),
      render: (item: BookCategory) => getParentName(item.parentId),
      className: 'max-w-xs truncate',
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: BookCategory) => (
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
