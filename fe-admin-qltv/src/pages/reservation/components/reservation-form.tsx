import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ReservationStatus,
  type Reservation,
  type ReservationStatusType,
} from '@/types/reservation.types'

export interface ReservationFormData {
  readerId: string
  bookId: string
  status?: ReservationStatusType
  cancellationReason?: string
}

interface ReservationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation: Reservation | null
  isSubmitting?: boolean
  onSubmit: (data: ReservationFormData) => Promise<void>
}

const initialFormData: ReservationFormData = {
  readerId: '',
  bookId: '',
}

export function ReservationForm({
  open,
  onOpenChange,
  reservation,
  isSubmitting = false,
  onSubmit,
}: ReservationFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<ReservationFormData>(initialFormData)

  useEffect(() => {
    if (reservation) {
      setFormData({
        readerId: reservation.readerId,
        bookId: reservation.bookId,
        status: reservation.status,
        cancellationReason: reservation.cancellationReason || '',
      })
    } else {
      setFormData(initialFormData)
    }
  }, [reservation])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleClose = () => {
    setFormData(initialFormData)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? t('reservations.edit') : t('reservations.addNew')}
          </DialogTitle>
          <DialogDescription>
            {reservation
              ? t('reservations.editDescription')
              : t('reservations.addDescription')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {!reservation && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="readerId">{t('reservations.readerId')} *</Label>
                  <Input
                    id="readerId"
                    type="text"
                    value={formData.readerId}
                    onChange={(e) =>
                      setFormData({ ...formData, readerId: e.target.value })
                    }
                    placeholder={t('reservations.readerIdPlaceholder')}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="bookId">{t('reservations.bookId')} *</Label>
                  <Input
                    id="bookId"
                    type="text"
                    value={formData.bookId}
                    onChange={(e) =>
                      setFormData({ ...formData, bookId: e.target.value })
                    }
                    placeholder={t('reservations.bookIdPlaceholder')}
                    required
                  />
                </div>
              </>
            )}

            {reservation && (
              <div className="grid gap-2">
                <Label htmlFor="status">{t('reservations.status')}</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: ReservationStatusType) =>
                    setFormData({ ...formData, status: value })
                  }
                  disabled={
                    reservation.status !== ReservationStatus.PENDING
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('common.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ReservationStatus.PENDING}>
                      {t('reservations.statusPending')}
                    </SelectItem>
                    <SelectItem value={ReservationStatus.FULFILLED}>
                      {t('reservations.statusFulfilled')}
                    </SelectItem>
                    <SelectItem value={ReservationStatus.CANCELLED}>
                      {t('reservations.statusCancelled')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {reservation && formData.status === ReservationStatus.CANCELLED && (
              <div className="grid gap-2">
                <Label htmlFor="cancellationReason">
                  {t('reservations.cancellationReason')} *
                </Label>
                <Input
                  id="cancellationReason"
                  type="text"
                  value={formData.cancellationReason || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, cancellationReason: e.target.value })
                  }
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t('common.loading') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
