import { useState, useMemo, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Breadcrumb } from '@/components/breadcrumb'
import { DeleteDialog } from '@/components/delete-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, AlertCircle } from 'lucide-react'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useImportUsers,
} from '@/hooks/use-users'
import { useReaderTypes } from '@/hooks/use-reader-types'
import { useReaders } from '@/hooks/use-readers'
import { useQueryParameters } from '@/hooks/use-query-parameters'
import { UserDetailsDialog } from './components/user-details-dialog'
import type { User, CreateUserRequest } from '@/types/user.types'
import { UsersTable } from './components/users-table'
import { UserForm } from './components/user-form'


function calculateNextCardNumber(readers: { cardNumber: string }[]): string {
  if (!readers || readers.length === 0) return '00001'
  const maxSeq = readers.reduce((max, reader) => {
    const match = reader.cardNumber.match(/(\d{5})$/)
    if (match) {
      const seq = parseInt(match[1], 10)
      return seq > max ? seq : max
    }
    return max
  }, 0)
  return (maxSeq + 1).toString().padStart(5, '0')
}

export function UsersPage() {
  const { t } = useTranslation('common')

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    tab: 'reader' as 'reader' | 'admin',
    page: 1,
    limit: 10,
    search: '',
    status: 'all' as 'all' | 'active' | 'inactive',
  })

  
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [viewingUserId, setViewingUserId] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState(params.search)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<{ email: string; reason: string }[] | null>(null)

  
  const { data, isLoading } = useUsers({
    type: params.tab,
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    is_active: params.status === 'all' ? undefined : params.status === 'active',
  })
  const { data: readerTypesData } = useReaderTypes({ page: 1, limit: 100 })
  const { data: readersData } = useReaders({ page: 1, limit: 1000 })
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()
  const importMutation = useImportUsers()

  
  const nextCardNumber = useMemo(() => {
    return calculateNextCardNumber(readersData?.data || [])
  }, [readersData?.data])

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

  
  const handleOpenSheet = (user?: User) => {
    if (user) {
      setEditingUser(user)
    } else {
      setEditingUser(null)
    }
    setIsSheetOpen(true)
  }

  const handleSubmit = async (formData: CreateUserRequest) => {
    if (editingUser) {
      const updateData = { ...formData }
      if (!updateData.password) {
        delete (updateData as Record<string, unknown>).password
      }
      await updateMutation.mutateAsync({
        id: editingUser.id,
        data: updateData as CreateUserRequest,
      })
    } else {
      await createMutation.mutateAsync(formData)
    }
  }

  const handleDelete = async () => {
    if (deletingUser) {
      await deleteMutation.mutateAsync(deletingUser.id)
      setDeletingUser(null)
    }
  }

  const handlePageChange = (newPage: number) => setParam('page', newPage)

  const handleTabChange = (newTab: 'reader' | 'admin') => {
    setMultipleParams({ tab: newTab, page: 1, search: '', status: 'all' })
    setSearchInput('')
  }

  const handleStatusFilter = (status: 'all' | 'active' | 'inactive') => {
    setParam('status', status)
    setParam('page', 1)
  }

  const handleViewDetails = (userId: string) => {
    setViewingUserId(userId)
    setDetailsDialogOpen(true)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setImportError(null)
        await importMutation.mutateAsync(file)
      } catch (err: unknown) {
        
        const error = err as { response?: { data?: { details?: { email: string; reason: string }[] } } }
        const details = error.response?.data?.details
        if (details && Array.isArray(details)) {
          setImportError(details)
        }
      } finally {
        
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t('sidebar.dashboard'), href: '/dashboard' },
          { label: t('users.title') },
        ]}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t('users.title')}</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{t('users.description')}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleImportClick}
            disabled={importMutation.isPending}
            className="cursor-pointer"
          >
            <Upload className="mr-2 h-4 w-4" />
            {importMutation.isPending ? t('users.importing') : t('users.import')}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button onClick={() => handleOpenSheet()} className="cursor-pointer">
            <span className="mr-2">+</span>
            {t('users.addNew')}
          </Button>
        </div>
      </div>

      <Tabs value={params.tab} onValueChange={(v) => handleTabChange(v as 'reader' | 'admin')}>
        <TabsList>
          <TabsTrigger value="reader">{t('users.tabs.reader')}</TabsTrigger>
          <TabsTrigger value="admin">{t('users.tabs.admin')}</TabsTrigger>
        </TabsList>
      </Tabs>

      {importError && importError.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium mb-2">
            <AlertCircle className="h-4 w-4" />
            {t('users.importError')}
          </div>
          <ul className="list-disc list-inside text-sm space-y-1 text-red-600 dark:text-red-400">
            {importError.map((err, index) => (
              <li key={index}>
                <span className="font-medium">{err.email}</span>: {err.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          type="text"
          placeholder={t('users.searchPlaceholder')}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className={cn('flex-1', isLoading && 'opacity-50')}
        />
        <Select
          value={params.status}
          onValueChange={(v) => handleStatusFilter((v || 'all') as 'all' | 'active' | 'inactive')}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder={t('users.statusFilter')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('users.statusAll')}</SelectItem>
            <SelectItem value="active">{t('users.statusActive')}</SelectItem>
            <SelectItem value="inactive">{t('users.statusInactive')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <UsersTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t('users.noData')}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(user) => setDeletingUser(user)}
        onView={handleViewDetails}
      />

      <UserForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        user={editingUser}
        users={data?.data || []}
        readerTypes={readerTypesData?.data || []}
        nextCardNumber={nextCardNumber}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      />

      <DeleteDialog
        open={!!deletingUser}
        onOpenChange={() => setDeletingUser(null)}
        title={t('users.deleteConfirmTitle')}
        description={t('users.deleteConfirmDescription', { name: deletingUser?.username })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />

      <UserDetailsDialog
        userId={viewingUserId}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
      />
    </div>
  )
}

export default UsersPage