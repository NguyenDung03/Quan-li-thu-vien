import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import { BookCoverCell, getBookCoverUrl } from '@/components/book-cover-cell'
import type { Ebook } from '@/types/ebook.types'
import { Download, FileText } from 'lucide-react'

interface EbooksTableProps {
  data: Ebook[]
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
  onEdit: (item: Ebook) => void
  onDelete: (item: Ebook) => void
}

export function EbooksTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: EbooksTableProps) {
  const { t } = useTranslation('common')

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const columns: Column<Ebook>[] = [
    {
      key: 'coverImage',
      header: t('books.coverImage'),
      className: 'w-20 shrink-0',
      render: (item: Ebook) => (
        <BookCoverCell url={getBookCoverUrl(item.book)} alt={item.book?.title} />
      ),
    },
    {
      key: 'book',
      header: t('ebooks.book'),
      className: 'min-w-0',
      render: (item: Ebook) => (
        <span className="font-medium">{item.book?.title || '-'}</span>
      ),
    },
    {
      key: 'fileFormat',
      header: t('ebooks.format'),
      render: (item: Ebook) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-400" />
          <span className="uppercase font-medium">{item.fileFormat}</span>
        </div>
      ),
    },
    {
      key: 'fileSize',
      header: t('ebooks.fileSize'),
      render: (item: Ebook) => formatFileSize(item.fileSize),
    },
    {
      key: 'downloadCount',
      header: t('ebooks.downloadCount'),
      render: (item: Ebook) => (
        <div className="flex items-center gap-2">
          <Download className="h-4 w-4 text-slate-400" />
          <span>{item.downloadCount}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Ebook) => (
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