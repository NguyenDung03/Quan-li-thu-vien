import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useAuthors,
  useCreateAuthor,
  useUpdateAuthor,
  useDeleteAuthor,
} from '@/hooks/use-authors'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { Author, CreateAuthorRequest } from '@/types/author.types'
import { AuthorsTable } from './components/authors-table'
import { AuthorForm } from './components/author-form'

export function AuthorsPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null)
  const [deletingAuthor, setDeletingAuthor] = useState<Author | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = useAuthors({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const createMutation = useCreateAuthor()
  const updateMutation = useUpdateAuthor()
  const deleteMutation = useDeleteAuthor()

  
  const handleOpenSheet = (author?: Author) => {
    if (author) {
      setEditingAuthor(author)
    } else {
      setEditingAuthor(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateAuthorRequest) => {
    if (editingAuthor) {
      await updateMutation.mutateAsync({
        id: editingAuthor.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingAuthor) {
      await deleteMutation.mutateAsync(deletingAuthor.id)
      setDeletingAuthor(null)
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
          { label: t('authors.title') },
        ]}
      />

      <PageHeader
        title={t('authors.title')}
        description={t('authors.description')}
        searchPlaceholder={t('authors.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('authors.addNew')}
      />

      <AuthorsTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('authors.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(author) => setDeletingAuthor(author)}
      />

      <AuthorForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        author={editingAuthor}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingAuthor}
        onOpenChange={() => setDeletingAuthor(null)}
        title={t('authors.deleteConfirmTitle')}
        description={t('authors.deleteConfirmDescription', {
          name: deletingAuthor?.authorName,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default AuthorsPage