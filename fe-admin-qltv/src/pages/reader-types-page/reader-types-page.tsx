import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import { useReaderTypes, useCreateReaderType, useUpdateReaderType, useDeleteReaderType } from '@/hooks/use-reader-types'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { ReaderType, CreateReaderTypeRequest } from '@/types/reader-type.types'
import { ReaderTypesTable } from './components/reader-types-table'
import { ReaderTypeForm } from './components/reader-type-form'

export function ReaderTypesPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam } = useQueryParameters({
    page: 1,
    limit: 10,
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingReaderType, setEditingReaderType] = useState<ReaderType | null>(null)
  const [deletingReaderType, setDeletingReaderType] = useState<ReaderType | null>(null)

  
  const { data, isLoading } = useReaderTypes({
    page: params.page,
    limit: params.limit,
  })
  const createMutation = useCreateReaderType()
  const updateMutation = useUpdateReaderType()
  const deleteMutation = useDeleteReaderType()

  
  const handleOpenSheet = (readerType?: ReaderType) => {
    if (readerType) {
      setEditingReaderType(readerType)
    } else {
      setEditingReaderType(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateReaderTypeRequest) => {
    if (editingReaderType) {
      await updateMutation.mutateAsync({
        id: editingReaderType.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingReaderType) {
      await deleteMutation.mutateAsync(deletingReaderType.id)
      setDeletingReaderType(null)
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
          { label: t('readerTypes.title') },
        ]}
      />

      <PageHeader
        title={t('readerTypes.title')}
        description={t('readerTypes.description')}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('readerTypes.addNew')}
      />

      <ReaderTypesTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('readerTypes.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingReaderType(item)}
      />

      <ReaderTypeForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        readerType={editingReaderType}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingReaderType}
        onOpenChange={() => setDeletingReaderType(null)}
        title={t('readerTypes.deleteConfirmTitle')}
        description={t('readerTypes.deleteConfirmDescription', {
          name: deletingReaderType?.typeName,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default ReaderTypesPage