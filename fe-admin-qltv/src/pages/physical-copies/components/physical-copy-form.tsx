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
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { PhysicalCopy, CreatePhysicalCopyRequest } from '@/types/physical-copy.types'

interface PhysicalCopyFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  physicalCopy: PhysicalCopy | null
  isSubmitting?: boolean
  onSubmit: (data: CreatePhysicalCopyRequest) => Promise<void>
}

const initialFormData: CreatePhysicalCopyRequest = {
  bookId: '',
  barcode: '',
  status: 'available',
  currentCondition: 'good',
  conditionDetails: '',
  purchaseDate: undefined,
  price: undefined,
  locationId: '',
}

export function PhysicalCopyForm({
  open,
  onOpenChange,
  physicalCopy,
  isSubmitting = false,
  onSubmit,
}: PhysicalCopyFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreatePhysicalCopyRequest>(initialFormData)

  useEffect(() => {
    if (physicalCopy) {
      setFormData({
        bookId: physicalCopy.bookId,
        barcode: physicalCopy.barcode,
        status: physicalCopy.status,
        currentCondition: physicalCopy.currentCondition,
        conditionDetails: physicalCopy.conditionDetails || '',
        purchaseDate: physicalCopy.purchaseDate,
        price: physicalCopy.price,
        locationId: physicalCopy.locationId || '',
      })
    } else {
      setFormData(initialFormData)
    }
  }, [physicalCopy])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleClose = () => {
    setFormData(initialFormData)
    onOpenChange(false)
  }

  const statusOptions = [
    { value: 'available', label: t('physicalCopies.available') },
    { value: 'borrowed', label: t('physicalCopies.borrowed') },
    { value: 'reserved', label: t('physicalCopies.reserved') },
    { value: 'damaged', label: t('physicalCopies.damaged') },
    { value: 'lost', label: t('physicalCopies.lost') },
    { value: 'maintenance', label: t('physicalCopies.maintenance') },
  ]

  const conditionOptions = [
    { value: 'new', label: t('physicalCopies.conditionNew') },
    { value: 'good', label: t('physicalCopies.conditionGood') },
    { value: 'worn', label: t('physicalCopies.conditionWorn') },
    { value: 'damaged', label: t('physicalCopies.conditionDamaged') },
  ]

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {physicalCopy ? t('physicalCopies.edit') : t('physicalCopies.addNew')}
          </SheetTitle>
          <SheetDescription>
            {physicalCopy
              ? t('physicalCopies.editDescription')
              : t('physicalCopies.addDescription')}
          </SheetDescription>
        </SheetHeader>

        
        {physicalCopy && (
          <div className="grid gap-4 py-4 border-b mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t('physicalCopies.book')}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t('books.name')}:</span>
                  <span className="font-medium">{physicalCopy.book?.title || '-'}</span>
                </div>
                {physicalCopy.book?.isbn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{t('books.isbn')}:</span>
                    <span className="font-mono text-sm">{physicalCopy.book.isbn}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t('physicalCopies.location')}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t('locations.name')}:</span>
                  <span className="font-medium">{physicalCopy.location?.name || '-'}</span>
                </div>
                {physicalCopy.location?.floor && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{t('locations.floor')}:</span>
                    <span className="text-sm">{physicalCopy.location.floor}</span>
                  </div>
                )}
                {physicalCopy.location?.section && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{t('locations.section')}:</span>
                    <span className="text-sm">{physicalCopy.location.section}</span>
                  </div>
                )}
                {physicalCopy.location?.shelf && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{t('locations.shelf')}:</span>
                    <span className="text-sm">{physicalCopy.location.shelf}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {!physicalCopy && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="bookId">{t('physicalCopies.book')} *</Label>
                  <Input
                    id="bookId"
                    type="text"
                    value={formData.bookId}
                    onChange={(e) =>
                      setFormData({ ...formData, bookId: e.target.value })
                    }
                    placeholder={t('physicalCopies.bookPlaceholder')}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="barcode">{t('physicalCopies.barcode')} *</Label>
                  <Input
                    id="barcode"
                    type="text"
                    value={formData.barcode}
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                    placeholder={t('physicalCopies.barcodePlaceholder')}
                    required
                  />
                </div>
              </>
            )}

            {physicalCopy && (
              <div className="grid gap-2">
                <Label htmlFor="barcode">{t('physicalCopies.barcode')} *</Label>
                <Input
                  id="barcode"
                  type="text"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData({ ...formData, barcode: e.target.value })
                  }
                  placeholder={t('physicalCopies.barcodePlaceholder')}
                  required
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">{t('physicalCopies.status')} *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: typeof formData.status) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t('physicalCopies.selectStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="currentCondition">{t('physicalCopies.condition')} *</Label>
                <Select
                  value={formData.currentCondition}
                  onValueChange={(value: typeof formData.currentCondition) =>
                    setFormData({ ...formData, currentCondition: value })
                  }
                >
                  <SelectTrigger id="currentCondition">
                    <SelectValue placeholder={t('physicalCopies.selectCondition')} />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="conditionDetails">{t('physicalCopies.conditionDetails')}</Label>
              <Input
                id="conditionDetails"
                type="text"
                value={formData.conditionDetails || ''}
                onChange={(e) =>
                  setFormData({ ...formData, conditionDetails: e.target.value })
                }
                placeholder={t('physicalCopies.conditionDetailsPlaceholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="purchaseDate">{t('physicalCopies.purchaseDate')}</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate?.split('T')[0] || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      purchaseDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="price">{t('physicalCopies.price')}</Label>
                <Input
                  id="price"
                  type="number"
                  min={0}
                  step={1}
                  value={formData.price ?? ''}
                  onChange={(e) => {
                    const v = e.target.value
                    setFormData({
                      ...formData,
                      price: v === '' ? undefined : Number(v),
                    })
                  }}
                />
                <p className="text-muted-foreground text-xs">{t('physicalCopies.priceHint')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {!physicalCopy && (
                <div className="grid gap-2">
                  <Label htmlFor="locationId">{t('physicalCopies.location')}</Label>
                  <Input
                    id="locationId"
                    type="text"
                    value={formData.locationId || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, locationId: e.target.value })
                    }
                    placeholder={t('physicalCopies.locationPlaceholder')}
                  />
                </div>
              )}
            </div>
          </div>
          <SheetFooter>
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
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}