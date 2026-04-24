import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { isAxiosError } from 'axios'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useBooks,
  useCreateBook,
  useUpdateBook,
  useDeleteBook,
} from '@/hooks/use-books'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { Book, CreateBookRequest } from '@/types/book.types'
import { bookApi } from '@/apis/book.api'
import { BooksTable } from './components/books-table'
import { BookForm } from './components/book-form'

function deleteBookErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response?.data) {
    return 'Không xóa được sách. Vui lòng thử lại.'
  }
  const data = error.response.data as { message?: string | string[] }
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.message)) return data.message.join(', ')
  return 'Không xóa được sách. Vui lòng thử lại.'
}

function saveBookErrorMessage(error: unknown): string {
  if (!isAxiosError(error) || !error.response?.data) {
    return 'Không lưu được sách. Vui lòng thử lại.'
  }
  const data = error.response.data as { message?: string | string[] }
  if (typeof data.message === 'string') return data.message
  if (Array.isArray(data.message)) return data.message.join(', ')
  return 'Không lưu được sách. Vui lòng thử lại.'
}

export function BooksPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = useBooks({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const createMutation = useCreateBook()
  const updateMutation = useUpdateBook()
  const deleteMutation = useDeleteBook()

  
  const handleOpenSheet = async (book?: Book) => {
    if (book) {
      try {
        const full = await bookApi.getBookById(book.id)
        setEditingBook(full)
      } catch {
        toast.error('Không tải được chi tiết sách')
        setEditingBook(book)
      }
    } else {
      setEditingBook(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateBookRequest) => {
    try {
      if (editingBook) {
        await updateMutation.mutateAsync({
          id: editingBook.id,
          data: formData,
        })
      } else {
        await createMutation.mutateAsync(formData)
      }
    } catch (e) {
      toast.error(saveBookErrorMessage(e))
      throw e
    }
  }

  const handleDelete = async () => {
    if (!deletingBook) return
    try {
      await deleteMutation.mutateAsync(deletingBook.id)
      toast.success('Đã xóa sách thành công')
      setDeletingBook(null)
    } catch (e) {
      toast.error(deleteBookErrorMessage(e))
    }
  }

  const handleSearchSubmit = () => {
    setMultipleParams({
      search: searchValue,
      page: 1,
    })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('sidebar.dashboard'), href: '/dashboard' },
          { label: t('books.title') },
        ]}
      />

      <PageHeader
        title={t('books.title')}
        description={t('books.description')}
        searchPlaceholder={t('books.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('books.addNew')}
      />

      <BooksTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('books.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(book) => setDeletingBook(book)}
      />

      <BookForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        book={editingBook}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingBook}
        onOpenChange={() => setDeletingBook(null)}
        title={t('books.deleteConfirmTitle')}
        description={t('books.deleteConfirmDescription', {
          name: deletingBook?.title,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default BooksPage
