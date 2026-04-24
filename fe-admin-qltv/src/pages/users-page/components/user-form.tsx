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
import type { User, CreateUserRequest } from '@/types/user.types'
import type { ReaderType } from '@/types/reader-type.types'

interface UserFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User | null
  users: User[]
  readerTypes: ReaderType[]
  nextCardNumber: string
  isSubmitting?: boolean
  onSubmit: (data: CreateUserRequest) => Promise<void>
}

const initialFormData = (nextCardNumber: string): CreateUserRequest => {
  const year = new Date().getFullYear().toString().slice(-2)
  return {
    username: '',
    email: '',
    password: '',
    role: 'reader',
    accountStatus: 'active',
    fullName: '',
    dob: '',
    gender: 'male',
    address: '',
    phone: '',
    readerTypeId: '',
    cardNumber: `HDA-UNK-${year}${nextCardNumber}`,
    cardIssueDate: new Date().toISOString().split('T')[0],
    cardExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  }
}

export function UserForm({
  open,
  onOpenChange,
  user,
  users,
  readerTypes,
  nextCardNumber,
  isSubmitting = false,
  onSubmit,
}: UserFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateUserRequest>(initialFormData(nextCardNumber))

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        accountStatus: user.accountStatus,
        fullName: user.fullName || '',
        dob: user.dob || '',
        gender: user.gender || 'male',
        address: user.address || '',
        phone: user.phone || '',
        readerTypeId: user.readerTypeId || '',
        cardNumber: user.cardNumber || '',
        cardIssueDate: user.cardIssueDate || '',
        cardExpiryDate: user.cardExpiryDate || '',
      })
    } else {
      setFormData(initialFormData(nextCardNumber))
    }
  }, [user, nextCardNumber])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleClose = () => {
    setFormData(initialFormData(nextCardNumber))
    onOpenChange(false)
  }

  const handleUserChange = (userId: string) => {
    const selectedUser = users.find((u) => u.id === userId)
    if (selectedUser) {
      setFormData({
        ...formData,
        readerId: userId,
        fullName: selectedUser.username,
      })
    }
  }

  const handleReaderTypeChange = (readerTypeId: string) => {
    const readerType = readerTypes.find((rt) => rt.id === readerTypeId)
    if (readerType) {
      const typePrefix = readerType.typeName.toUpperCase().slice(0, 3) || 'UNK'
      const year = new Date().getFullYear().toString().slice(-2)
      const cardNumber = `HDA-${typePrefix}-${year}${nextCardNumber}`

      setFormData({
        ...formData,
        readerTypeId,
        cardNumber,
        cardIssueDate: new Date().toISOString().split('T')[0],
        cardExpiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
    } else {
      setFormData({ ...formData, readerTypeId })
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {user ? t('users.edit') : t('users.addNew')}
          </SheetTitle>
          <SheetDescription>
            {user ? t('users.editDescription') : t('users.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t('users.username')}
              </label>
              <input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('users.usernamePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t('users.email')}
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('users.emailPlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="password" className="text-sm font-medium">
                {t('users.password')}
                {user && <span className="text-slate-400 text-xs ml-1">({t('users.optional')})</span>}
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={user ? t('users.passwordEditPlaceholder') : t('users.passwordPlaceholder')}
                required={!user}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="role" className="text-sm font-medium">
                  {t('users.role')}
                </label>
                <select
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'reader' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="admin">{t('auth.admin')}</option>
                  <option value="reader">{t('auth.reader')}</option>
                </select>
              </div>
              <div className="grid gap-2">
                <label htmlFor="accountStatus" className="text-sm font-medium">
                  {t('users.accountStatus')}
                </label>
                <select
                  id="accountStatus"
                  value={formData.accountStatus}
                  onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value as 'active' | 'inactive' })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="active">{t('users.active')}</option>
                  <option value="inactive">{t('users.inactive')}</option>
                </select>
              </div>
            </div>

            
            {formData.role === 'reader' && (
              <>
                {!user && (
                  <div className="grid gap-2">
                    <label htmlFor="userId" className="text-sm font-medium">
                      {t('users.selectUser')}
                    </label>
                    <select
                      id="userId"
                      value={formData.readerId}
                      onChange={(e) => handleUserChange(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="">{t('users.selectUserPlaceholder')}</option>
                      {users.filter((u) => u.role === 'reader').map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username} - {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid gap-2">
                  <label htmlFor="readerTypeId" className="text-sm font-medium">
                    {t('users.readerType')}
                  </label>
                  <select
                    id="readerTypeId"
                    value={formData.readerTypeId}
                    onChange={(e) => handleReaderTypeChange(e.target.value)}
                    disabled={!!user}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">{t('users.selectReaderType')}</option>
                    {readerTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.typeName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="fullName" className="text-sm font-medium">
                    {t('users.fullName')}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder={t('users.fullNamePlaceholder')}
                    required={formData.role === 'reader'}
                    disabled={!!user}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="dob" className="text-sm font-medium">
                      {t('users.dob')}
                    </label>
                    <input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      required={formData.role === 'reader'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="gender" className="text-sm font-medium">
                      {t('users.gender')}
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' | 'other' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="male">{t('users.male')}</option>
                      <option value="female">{t('users.female')}</option>
                      <option value="other">{t('users.other')}</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">
                    {t('users.phone')}
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('users.phonePlaceholder')}
                    required={formData.role === 'reader'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    {t('users.address')}
                  </label>
                  <input
                    id="address"
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('users.addressPlaceholder')}
                    required={formData.role === 'reader'}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>

                <div className="grid gap-2">
                  <label htmlFor="cardNumber" className="text-sm font-medium">
                    {t('users.cardNumber')}
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    value={formData.cardNumber}
                    readOnly
                    disabled={!!user}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-slate-50 dark:bg-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <label htmlFor="cardIssueDate" className="text-sm font-medium">
                      {t('users.cardIssueDate')}
                    </label>
                    <input
                      id="cardIssueDate"
                      type="date"
                      value={formData.cardIssueDate}
                      onChange={(e) => setFormData({ ...formData, cardIssueDate: e.target.value })}
                      required={formData.role === 'reader'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="cardExpiryDate" className="text-sm font-medium">
                      {t('users.cardExpiryDate')}
                    </label>
                    <input
                      id="cardExpiryDate"
                      type="date"
                      value={formData.cardExpiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, cardExpiryDate: e.target.value })}
                      required={formData.role === 'reader'}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={handleClose} className="cursor-pointer">
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t('common.loading') : t('common.save')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}