import { useTranslation } from 'react-i18next'
import { Eye } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useUserWithReader } from '@/hooks/use-users'

interface UserDetailsDialogProps {
  userId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onViewReader?: (readerId: string) => void
}

export function UserDetailsDialog({
  userId,
  open,
  onOpenChange,
  onViewReader,
}: UserDetailsDialogProps) {
  const { t } = useTranslation('common')
  const { data: userData, isLoading, error } = useUserWithReader(userId || '')

  const handleViewReader = () => {
    if (userData?.reader?.id && onViewReader) {
      onViewReader(userData.reader.id)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('users.details.title')}</DialogTitle>
          <DialogDescription>
            {userData?.username}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-slate-500">{t('common.loading')}</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-red-500">{t('common.error')}</div>
          </div>
        ) : userData ? (
          <div className="space-y-6">

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {t('users.details.accountInfo')}
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">{t('users.details.username')}: </span>
                  <span className="font-medium">{userData.username}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('users.details.email')}: </span>
                  <span className="font-medium">{userData.email}</span>
                </div>
                <div>
                  <span className="text-slate-500">{t('users.details.role')}: </span>
                  <span className="font-medium">
                    {t(`auth.${userData.role}`)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">{t('users.details.accountStatus')}: </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      userData.accountStatus === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                    }`}
                  >
                    {userData.accountStatus === 'active' ? t('users.active') : t('users.inactive')}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">{t('users.details.lastLogin')}: </span>
                  <span className="font-medium">
                    {userData.lastLogin ? new Date(userData.lastLogin).toLocaleString() : '-'}
                  </span>
                </div>
              </div>
            </div>


            {userData.role === 'reader' && userData.reader && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t('users.details.readerInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-500">{t('users.details.fullName')}: </span>
                    <span className="font-medium">{userData.reader.fullName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.cardNumber')}: </span>
                    <span className="font-medium">{userData.reader.cardNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.readerType')}: </span>
                    <span className="font-medium">{userData.reader.readerType}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.phone')}: </span>
                    <span className="font-medium">{userData.reader.phone}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-500">{t('users.details.address')}: </span>
                    <span className="font-medium">{userData.reader.address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.dob')}: </span>
                    <span className="font-medium">
                      {userData.reader.dob ? new Date(userData.reader.dob).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.gender')}: </span>
                    <span className="font-medium">
                      {userData.reader.gender === 'male'
                        ? t('common.male')
                        : userData.reader.gender === 'female'
                          ? t('common.female')
                          : t('common.other')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.cardIssueDate')}: </span>
                    <span className="font-medium">
                      {userData.reader.cardIssueDate
                        ? new Date(userData.reader.cardIssueDate).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">{t('users.details.cardExpiryDate')}: </span>
                    <span className="font-medium">
                      {userData.reader.cardExpiryDate
                        ? new Date(userData.reader.cardExpiryDate).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <DialogFooter>
          {userData?.role === 'reader' && userData?.reader && (
            <Button
              type="button"
              variant="outline"
              onClick={handleViewReader}
              className="cursor-pointer"
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('users.details.viewReader')}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
