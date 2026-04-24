import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import {
  useLocations,
  useCreateLocation,
  useUpdateLocation,
  useDeleteLocation,
} from '@/hooks/use-locations'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import type { Location, CreateLocationRequest } from '@/types/location.types'
import { LocationsTable } from './components/locations-table'
import { LocationForm } from './components/location-form'

export function LocationsPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deletingLocation, setDeletingLocation] = useState<Location | null>(null)
  const [searchValue, setSearchValue] = useState('')

  
  const { data, isLoading } = useLocations({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const createMutation = useCreateLocation()
  const updateMutation = useUpdateLocation()
  const deleteMutation = useDeleteLocation()

  
  const handleOpenSheet = (location?: Location) => {
    if (location) {
      setEditingLocation(location)
    } else {
      setEditingLocation(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateLocationRequest) => {
    if (editingLocation) {
      await updateMutation.mutateAsync({
        id: editingLocation.id,
        data: formData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingLocation) {
      await deleteMutation.mutateAsync(deletingLocation.id)
      setDeletingLocation(null)
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
          { label: t('locations.title') },
        ]}
      />

      <PageHeader
        title={t('locations.title')}
        description={t('locations.description')}
        searchPlaceholder={t('locations.search')}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('locations.addNew')}
      />

      <LocationsTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('locations.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(item) => setDeletingLocation(item)}
      />

      <LocationForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        location={editingLocation}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingLocation}
        onOpenChange={() => setDeletingLocation(null)}
        title={t('locations.deleteConfirmTitle')}
        description={t('locations.deleteConfirmDescription', {
          name: deletingLocation?.name,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default LocationsPage