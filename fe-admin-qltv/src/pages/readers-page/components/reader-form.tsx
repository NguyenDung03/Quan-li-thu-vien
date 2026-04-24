import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Reader, CreateReaderRequest } from '@/types/reader.types'
import type { User } from '@/types/user.types'
import type { ReaderType } from '@/types/reader-type.types'

interface ReaderFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reader: Reader | null
  users: User[]
  readerTypes: ReaderType[]
  nextCardSequence: string
  isSubmitting?: boolean
  onSubmit: (data: CreateReaderRequest) => Promise<void>
}

const initialFormData = (nextCardSequence: string): CreateReaderRequest => {
  const year = new Date().getFullYear().toString().slice(-2)
  return {
    userId: '',
    readerTypeId: '',
    fullName: '',
    dob: '',
    gender: 'male',
    address: '',
    phone: '',
    cardNumber: `HDA-UNK-${year}${nextCardSequence}`,
    cardIssueDate: new Date().toISOString().split('T')[0],
    cardExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isActive: true,
  }
}

export function ReaderForm({
  open,
  onOpenChange,
  reader,
  users,
  readerTypes,
  nextCardSequence,
  isSubmitting = false,
  onSubmit,
}: ReaderFormProps) {
  const { t } = useTranslation('reader')
  const [formData, setFormData] = useState<CreateReaderRequest>(initialFormData(nextCardSequence))

  useEffect(() => {
    if (reader) {
      setFormData({
        userId: reader.userId,
        readerTypeId: reader.readerTypeId,
        fullName: reader.fullName,
        dob: reader.dob,
        gender: reader.gender,
        address: reader.address,
        phone: reader.phone,
        cardNumber: reader.cardNumber,
        cardIssueDate: reader.cardIssueDate,
        cardExpiryDate: reader.cardExpiryDate,
        isActive: reader.isActive,
      })
    } else {
      setFormData(initialFormData(nextCardSequence))
    }
  }, [reader, nextCardSequence])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleClose = () => {
    setFormData(initialFormData(nextCardSequence))
    onOpenChange(false)
  }

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId)
    if (selectedUser) {
      setFormData({
        ...formData,
        userId,
        fullName: selectedUser.username,
      })
    }
  }

  const handleReaderTypeChange = (readerTypeId: string) => {
    const readerType = readerTypes.find((rt) => rt.id === readerTypeId)
    if (readerType) {
      const typePrefix = readerType.typeName.toUpperCase().slice(0, 3) || 'UNK'
      const year = new Date().getFullYear().toString().slice(-2)
      const cardNumber = `HDA-${typePrefix}-${year}${nextCardSequence}`

      setFormData({
        ...formData,
        readerTypeId,
        cardIssueDate: new Date().toISOString().split('T')[0],
        cardExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        cardNumber,
      })
    } else {
      setFormData({ ...formData, readerTypeId })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{reader ? t('edit') : t('addNew')}</SheetTitle>
          <SheetDescription>
            {reader ? t('editDescription') : t('addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {!reader && (
              <div className="grid gap-2">
                <label htmlFor="userId" className="text-sm font-medium">
                  {t('selectUser')}
                </label>
                <select
                  id="userId"
                  value={formData.userId}
                  onChange={(e) => handleUserChange(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">{t('selectUser')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
            )}

            
            <div className="grid gap-2">
              <label htmlFor="readerTypeId" className="text-sm font-medium">
                {t('readerType')}
              </label>
              <select
                id="readerTypeId"
                value={formData.readerTypeId}
                onChange={(e) => handleReaderTypeChange(e.target.value)}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">{t('selectReaderType')}</option>
                {readerTypes.map((rt) => (
                  <option key={rt.id} value={rt.id}>
                    {rt.typeName}
                  </option>
                ))}
              </select>
            </div>

            
            <div className="grid gap-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                {t('fullName')}
              </label>
              <input
                id="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('fullNamePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="dob" className="text-sm font-medium">
                  {t('dob')}
                </label>
                <input
                  id="dob"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="gender" className="text-sm font-medium">
                  {t('gender')}
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="male">{t('male')}</option>
                  <option value="female">{t('female')}</option>
                  <option value="other">{t('other')}</option>
                </select>
              </div>
            </div>

            
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                {t('address')}
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('addressPlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            
            <div className="grid gap-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t('phone')}
              </label>
              <input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('phonePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            
            <div className="grid gap-2">
              <label htmlFor="cardNumber" className="text-sm font-medium">
                {t('cardNumber')}
                {!reader && <span className="text-slate-400 text-xs ml-1"> ({t('autoGenerated')})</span>}
              </label>
              <input
                id="cardNumber"
                type="text"
                value={formData.cardNumber}
                readOnly={!reader}
                required
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  !reader ? 'bg-slate-100 dark:bg-slate-800' : ''
                }`}
              />
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="cardIssueDate" className="text-sm font-medium">
                  {t('cardIssueDate')}
                </label>
                <input
                  id="cardIssueDate"
                  type="date"
                  value={formData.cardIssueDate}
                  onChange={(e) => setFormData({ ...formData, cardIssueDate: e.target.value })}
                  disabled={!reader}
                  required
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    !reader ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="cardExpiryDate" className="text-sm font-medium">
                  {t('cardExpiryDate')}
                </label>
                <input
                  id="cardExpiryDate"
                  type="date"
                  value={formData.cardExpiryDate || ''}
                  onChange={(e) => setFormData({ ...formData, cardExpiryDate: e.target.value || null })}
                  disabled={!reader}
                  className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                    !reader ? 'bg-slate-100 dark:bg-slate-800' : ''
                  }`}
                />
              </div>
            </div>

            
            <div className="flex items-center gap-2">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
              />
              <label htmlFor="isActive" className="text-sm font-normal">
                {t('isActive')}
              </label>
            </div>
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t('loading') : t('save')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
