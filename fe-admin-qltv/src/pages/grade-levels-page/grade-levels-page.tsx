import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useGradeLevels,
  useCreateGradeLevel,
  useUpdateGradeLevel,
  useDeleteGradeLevel,
} from '@/hooks/use-grade-levels'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { GradeLevel, CreateGradeLevelRequest } from '@/types/grade-level.types'
import { GradeLevelsTable } from './components/grade-levels-table'
import { GradeLevelForm } from './components/grade-level-form'

export function GradeLevelsPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingGradeLevel, setEditingGradeLevel] = useState<GradeLevel | null>(null)
  const [deletingGradeLevel, setDeletingGradeLevel] = useState<GradeLevel | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = useGradeLevels({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const createMutation = useCreateGradeLevel()
  const updateMutation = useUpdateGradeLevel()
  const deleteMutation = useDeleteGradeLevel()

  
  const handleOpenSheet = (gradeLevel?: GradeLevel) => {
    if (gradeLevel) {
      setEditingGradeLevel(gradeLevel)
    } else {
      setEditingGradeLevel(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateGradeLevelRequest) => {
    if (editingGradeLevel) {
      await updateMutation.mutateAsync({
        id: editingGradeLevel.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingGradeLevel) {
      await deleteMutation.mutateAsync(deletingGradeLevel.id)
      setDeletingGradeLevel(null)
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
          { label: t('gradeLevels.title') },
        ]}
      />

      <PageHeader
        title={t('gradeLevels.title')}
        description={t('gradeLevels.description')}
        searchPlaceholder={t('gradeLevels.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('gradeLevels.addNew')}
      />

      <GradeLevelsTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('gradeLevels.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingGradeLevel(item)}
      />

      <GradeLevelForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        gradeLevel={editingGradeLevel}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingGradeLevel}
        onOpenChange={() => setDeletingGradeLevel(null)}
        title={t('gradeLevels.deleteConfirmTitle')}
        description={t('gradeLevels.deleteConfirmDescription', {
          name: deletingGradeLevel?.name,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default GradeLevelsPage
