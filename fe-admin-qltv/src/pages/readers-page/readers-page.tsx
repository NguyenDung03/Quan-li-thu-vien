import { useState, useMemo, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Breadcrumb } from '@/components/breadcrumb'
import { PageHeader } from '@/components/page-header'
import { DeleteDialog } from '@/components/delete-dialog'
import { useReaders, useCreateReader, useUpdateReader, useDeleteReader } from '@/hooks/use-readers'
import { useUsers } from '@/hooks/use-users'
import { useReaderTypes } from '@/hooks/use-reader-types'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import { calculateNextCardSequence } from '@/utils/card-generator'
import type { Reader, CreateReaderRequest } from '@/types/reader.types'
import { ReadersTable } from './components/readers-table'
import { ReaderForm } from './components/reader-form'

export function ReadersPage() {
  const { t } = useTranslation('reader')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: '',
    readerId: '',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingReader, setEditingReader] = useState<Reader | null>(null)
  const [deletingReader, setDeletingReader] = useState<Reader | null>(null)
  const [searchInput, setSearchInput] = useState(params.search)

  
  const { data, isLoading } = useReaders({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
  })
  const { data: usersData } = useUsers({ page: 1, limit: 100 })
  const { data: readerTypesData } = useReaderTypes({ page: 1, limit: 100 })
  const createMutation = useCreateReader()
  const updateMutation = useUpdateReader()
  const deleteMutation = useDeleteReader()

  const debouncedSearch = searchInput.trim()
  const urlSearch = String(params.search ?? '').trim()

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== urlSearch) {
        setMultipleParams({ search: debouncedSearch, page: 1 })
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [debouncedSearch, urlSearch, setMultipleParams])

  
  const nextCardSequence = useMemo(() => {
    return calculateNextCardSequence(data?.data || [])
  }, [data?.data])

  
  const handleOpenSheet = (reader?: Reader) => {
    if (reader) {
      setEditingReader(reader)
    } else {
      setEditingReader(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateReaderRequest) => {
    if (editingReader) {
      const updateData = { ...formData }
      delete (updateData as Record<string, unknown>).userId
      await updateMutation.mutateAsync({
        id: editingReader.id,
        data: updateData,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingReader) {
      await deleteMutation.mutateAsync(deletingReader.id)
      setDeletingReader(null)
    }
  }

  const handleSearchSubmit = () => {
    setMultipleParams({ search: searchInput.trim(), page: 1 })
  }

  const handlePageChange = (newPage: number) => {
    setParam('page', newPage)
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  
  const getReaderTypeName = (readerTypeId: string) => {
    const readerType = readerTypesData?.data.find((rt) => rt.id === readerTypeId)
    return readerType?.typeName || readerTypeId
  }

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('title', { ns: 'common' }), href: '/dashboard' },
          { label: t('title') },
        ]}
      />

      <PageHeader
        title={t('title')}
        description={t('description')}
        searchPlaceholder={t('search')}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        onAddClick={() => handleOpenSheet()}
        addButtonLabel={t('addNew')}
      />

      <ReadersTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(reader) => setDeletingReader(reader)}
        getReaderTypeName={getReaderTypeName}
      />

      <ReaderForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        reader={editingReader}
        users={usersData?.data || []}
        readerTypes={readerTypesData?.data || []}
        nextCardSequence={nextCardSequence}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingReader}
        onOpenChange={() => setDeletingReader(null)}
        title={t('deleteConfirmTitle')}
        description={t('deleteConfirmDescription', {
          name: deletingReader?.fullName,
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}

export default ReadersPage
