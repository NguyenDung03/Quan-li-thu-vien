import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import type { User } from '@/types/user.types'

interface UsersTableProps {
  data: User[]
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
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onView: (userId: string) => void
}

export function UsersTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  onView,
}: UsersTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<User>[] = [
    {
      key: 'username',
      header: t('users.username'),
      render: (item: User) => <span className="font-medium">{item.username}</span>,
    },
    {
      key: 'email',
      header: t('users.email'),
      render: (item: User) => item.email,
    },
    {
      key: 'role',
      header: t('users.role'),
      render: (item: User) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.role === 'admin'
              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
          }`}
        >
          {t(`auth.${item.role}`)}
        </span>
      ),
    },
    {
      key: 'accountStatus',
      header: t('users.accountStatus'),
      render: (item: User) => (
        <span
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            item.accountStatus === 'active'
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {item.accountStatus === 'active' ? t('users.active') : t('users.inactive')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: User) => (
        <ActionButtons
          showView
          onView={() => onView(item.id)}
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
