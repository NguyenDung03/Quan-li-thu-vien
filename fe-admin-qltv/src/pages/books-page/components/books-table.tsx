import { useTranslation } from 'react-i18next'
import { DataTable, type Column } from '@/components/data-table'
import { ActionButtons } from '@/components/action-buttons'
import { BookCoverCell, getBookCoverUrl } from '@/components/book-cover-cell'
import type { Book } from '@/types/book.types'

interface BooksTableProps {
  data: Book[]
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
  onEdit: (book: Book) => void
  onDelete: (book: Book) => void
}

export function BooksTable({
  data,
  meta,
  loading = false,
  noDataText = 'Không có dữ liệu',
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: BooksTableProps) {
  const { t } = useTranslation('common')

  const columns: Column<Book>[] = [
    {
      key: 'coverImage',
      header: t('books.coverImage'),
      
      className: 'w-20 shrink-0',
      render: (item: Book) => (
        <BookCoverCell url={getBookCoverUrl(item)} alt={item.title} />
      ),
    },
    {
      key: 'title',
      header: t('books.name'),
      className: 'min-w-0',
      render: (item: Book) => (
        <span className="font-medium max-w-xs truncate block">{item.title}</span>
      ),
    },
    {
      key: 'isbn',
      header: t('books.isbn'),
      render: (item: Book) => item.isbn,
    },
    {
      key: 'publisher',
      header: t('books.publisher'),
      render: (item: Book) => item.publisher?.publisherName || item.publisherId || '-',
      className: 'max-w-xs truncate',
    },
    {
      key: 'bookType',
      header: t('books.bookType'),
      render: (item: Book) => (
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
            item.bookType === 'ebook'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
          }`}
        >
          {item.bookType === 'ebook' ? t('books.ebook') : t('books.physical')}
        </span>
      ),
    },
    {
      key: 'language',
      header: t('books.language'),
      render: (item: Book) => item.language,
    },
    {
      key: 'publishYear',
      header: t('books.publishYear'),
      render: (item: Book) => item.publishYear,
    },
    {
      key: 'actions',
      header: t('common.actions'),
      render: (item: Book) => (
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