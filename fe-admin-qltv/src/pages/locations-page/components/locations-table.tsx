import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { Location } from '@/types/location.types'

interface LocationsTableProps {
  data: Location[]
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
  onEdit: (item: Location) => void
  onDelete: (item: Location) => void
}

export function LocationsTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: LocationsTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<Location>[] = [
    {
      key: 'name',
      header: t('locations.name'),
      render: (item: Location) => <span className="font-medium">{item.name}</span>,
    },
    {
      key: 'floor',
      header: t('locations.floor'),
      render: (item: Location) => item.floor || '-',
    },
    {
      key: 'section',
      header: t('locations.section'),
      render: (item: Location) => item.section || '-',
    },
    {
      key: 'shelf',
      header: t('locations.shelf'),
      render: (item: Location) => item.shelf || '-',
    },
    {
      key: 'isActive',
      header: t('locations.isActive'),
      render: (item: Location) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400'
          }`}
        >
          {item.isActive ? t('locations.isActive') : t('common.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Location) => (
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
