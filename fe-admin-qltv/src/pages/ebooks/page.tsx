import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useEbooks,
  useCreateEbook,
  useUpdateEbook,
  useDeleteEbook,
} from '@/hooks/use-ebooks'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { Ebook, CreateEbookRequest } from '@/types/ebook.types'
import { EbooksTable } from './components/ebooks-table'
import { EbookForm } from './components/ebook-form'

export function EbooksPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam } = useQueryParameters({
    page: 1,
    limit: 10,
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingEbook, setEditingEbook] = useState<Ebook | null>(null)
  const [deletingEbook, setDeletingEbook] = useState<Ebook | null>(null)

  
  const { data, isLoading } = useEbooks({
    page: params.page,
    limit: params.limit,
  })
  const createMutation = useCreateEbook()
  const updateMutation = useUpdateEbook()
  const deleteMutation = useDeleteEbook()

  
  const handleOpenSheet = (ebook?: Ebook) => {
    if (ebook) {
      setEditingEbook(ebook)
    } else {
      setEditingEbook(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateEbookRequest) => {
    if (editingEbook) {
      await updateMutation.mutateAsync({
        id: editingEbook.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingEbook) {
      await deleteMutation.mutateAsync(deletingEbook.id)
      setDeletingEbook(null)
    }
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
          { label: t('ebooks.title') },
        ]}
      />

      <PageHeader
        title={t('ebooks.title')}
        description={t('ebooks.description')}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('ebooks.addNew')}
      />

      <EbooksTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('ebooks.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingEbook(item)}
      />

      <EbookForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        ebook={editingEbook}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingEbook}
        onOpenChange={() => setDeletingEbook(null)}
        title={t('ebooks.deleteConfirmTitle')}
        description={t('ebooks.deleteConfirmDescription', {
          name: deletingEbook?.book?.title,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
