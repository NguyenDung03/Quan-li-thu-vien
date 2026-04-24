import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { GradeLevel } from '@/types/grade-level.types'

interface GradeLevelsTableProps {
  data: GradeLevel[]
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
  onEdit: (item: GradeLevel) => void
  onDelete: (item: GradeLevel) => void
}

export function GradeLevelsTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: GradeLevelsTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<GradeLevel>[] = [
    {
      key: 'name',
      header: t('gradeLevels.name'),
      render: (item: GradeLevel) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'description',
      header: t('gradeLevels.description'),
      render: (item: GradeLevel) => item.description || '-',
      className: 'max-w-xs truncate',
    },
    {
      key: 'orderNo',
      header: t('gradeLevels.orderNo'),
      render: (item: GradeLevel) => item.orderNo,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: GradeLevel) => (
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
