import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  usePublishers,
  useCreatePublisher,
  useUpdatePublisher,
  useDeletePublisher,
} from '@/hooks/use-publishers'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { Publisher, CreatePublisherRequest } from '@/types/publisher.types'
import { PublishersTable } from './components/publishers-table'
import { PublisherForm } from './components/publisher-form'

export function PublishersPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingPublisher, setEditingPublisher] = useState<Publisher | null>(null)
  const [deletingPublisher, setDeletingPublisher] = useState<Publisher | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = usePublishers({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const createMutation = useCreatePublisher()
  const updateMutation = useUpdatePublisher()
  const deleteMutation = useDeletePublisher()

  
  const handleOpenSheet = (publisher?: Publisher) => {
    if (publisher) {
      setEditingPublisher(publisher)
    } else {
      setEditingPublisher(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreatePublisherRequest) => {
    if (editingPublisher) {
      await updateMutation.mutateAsync({
        id: editingPublisher.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingPublisher) {
      await deleteMutation.mutateAsync(deletingPublisher.id)
      setDeletingPublisher(null)
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
          { label: t('publishers.title') },
        ]}
      />

      <PageHeader
        title={t('publishers.title')}
        description={t('publishers.description')}
        searchPlaceholder={t('publishers.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('publishers.addNew')}
      />

      <PublishersTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('publishers.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(publisher) => setDeletingPublisher(publisher)}
      />

      <PublisherForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        publisher={editingPublisher}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingPublisher}
        onOpenChange={() => setDeletingPublisher(null)}
        title={t('publishers.deleteConfirmTitle')}
        description={t('publishers.deleteConfirmDescription', {
          name: deletingPublisher?.publisherName,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default PublishersPage
