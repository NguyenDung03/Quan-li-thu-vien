import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useBookCategories,
  useCreateBookCategory,
  useUpdateBookCategory,
  useDeleteBookCategory,
} from '@/hooks/use-book-categories'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { BookCategory, CreateBookCategoryRequest } from '@/types/book-category.types'
import { BookCategoriesTable } from './components/book-categories-table'
import { BookCategoryForm } from './components/book-category-form'

export function BookCategoriesPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<BookCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<BookCategory | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = useBookCategories({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const { data: allCategories } = useBookCategories({ page: 1, limit: 100 })
  const createMutation = useCreateBookCategory()
  const updateMutation = useUpdateBookCategory()
  const deleteMutation = useDeleteBookCategory()

  
  const handleOpenSheet = (category?: BookCategory) => {
    if (category) {
      setEditingCategory(category)
    } else {
      setEditingCategory(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateBookCategoryRequest) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingCategory) {
      await deleteMutation.mutateAsync(deletingCategory.id)
      setDeletingCategory(null)
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

  
  const getParentName = (parentId?: string) => {
    if (!parentId) return '-'
    const parent = allCategories?.data.find((c) => c.id === parentId)
    return parent?.name || '-'
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('sidebar.dashboard'), href: '/dashboard' },
          { label: t('bookCategories.title') },
        ]}
      />

      <PageHeader
        title={t('bookCategories.title')}
        description={t('bookCategories.description')}
        searchPlaceholder={t('bookCategories.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('bookCategories.addNew')}
      />

      <BookCategoriesTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('bookCategories.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(category) => setDeletingCategory(category)}
        getParentName={getParentName}
      />

      <BookCategoryForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        category={editingCategory}
        categories={allCategories?.data || []}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
        title={t('bookCategories.deleteConfirmTitle')}
        description={t('bookCategories.deleteConfirmDescription', {
          name: deletingCategory?.name,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default BookCategoriesPage