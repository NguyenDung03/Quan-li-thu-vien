import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  usePhysicalCopies,
  useCreatePhysicalCopy,
  useUpdatePhysicalCopy,
  useDeletePhysicalCopy,
} from '@/hooks/use-physical-copies'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { PhysicalCopy, CreatePhysicalCopyRequest } from '@/types/physical-copy.types'
import { PhysicalCopiesTable } from './components/physical-copies-table'
import { PhysicalCopyForm } from './components/physical-copy-form'

export function PhysicalCopiesPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam } = useQueryParameters({
    page: 1,
    limit: 10,
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingPhysicalCopy, setEditingPhysicalCopy] = useState<PhysicalCopy | null>(null)
  const [deletingPhysicalCopy, setDeletingPhysicalCopy] = useState<PhysicalCopy | null>(null)

  
  const { data, isLoading } = usePhysicalCopies({
    page: params.page,
    limit: params.limit,
  })
  const createMutation = useCreatePhysicalCopy()
  const updateMutation = useUpdatePhysicalCopy()
  const deleteMutation = useDeletePhysicalCopy()

  
  const handleOpenSheet = (physicalCopy?: PhysicalCopy) => {
    if (physicalCopy) {
      setEditingPhysicalCopy(physicalCopy)
    } else {
      setEditingPhysicalCopy(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreatePhysicalCopyRequest) => {
    if (editingPhysicalCopy) {
      await updateMutation.mutateAsync({
        id: editingPhysicalCopy.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingPhysicalCopy) {
      await deleteMutation.mutateAsync(deletingPhysicalCopy.id)
      setDeletingPhysicalCopy(null)
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
          { label: t('physicalCopies.title') },
        ]}
      />

      <PageHeader
        title={t('physicalCopies.title')}
        description={t('physicalCopies.description')}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('physicalCopies.addNew')}
      />

      <PhysicalCopiesTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('physicalCopies.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingPhysicalCopy(item)}
      />

      <PhysicalCopyForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        physicalCopy={editingPhysicalCopy}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingPhysicalCopy}
        onOpenChange={() => setDeletingPhysicalCopy(null)}
        title={t('physicalCopies.deleteConfirmTitle')}
        description={t('physicalCopies.deleteConfirmDescription', {
          name: deletingPhysicalCopy?.barcode,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
