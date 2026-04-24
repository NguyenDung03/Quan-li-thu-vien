import { useState, useEffect, useMemo } from 'react'
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
import type { Fine, CreateFineRequest } from '@/types/fine.types'

interface FineFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  fine: Fine | null
  
  initialDraft?: Partial<CreateFineRequest> | null
  isSubmitting?: boolean
  onSubmit: (data: CreateFineRequest) => Promise<void>
}

const initialFormData: CreateFineRequest = {
  borrowId: '',
  fineAmount: 0,
  fineDate: new Date().toISOString(),
  reason: '',
  status: 'unpaid',
  paymentDate: undefined,
}

function fineDateToInputValue(iso: string | undefined): string {
  if (!iso) return ''
  if (iso.includes('T')) return iso.split('T')[0] ?? ''
  return iso.slice(0, 10)
}


function physicalCopyFineReferenceAmount(
  copy:
    | {
        price?: number | null
        purchasePrice?: number | null
      }
    | undefined,
): number | null {
  if (!copy) return null
  if (copy.price != null) {
    const n = Number(copy.price)
    if (Number.isFinite(n) && n > 0) return n
  }
  if (copy.purchasePrice != null) {
    const n = Number(copy.purchasePrice)
    if (Number.isFinite(n) && n > 0) return n
  }
  return null
}

export function FineForm({
  open,
  onOpenChange,
  fine,
  initialDraft = null,
  isSubmitting = false,
  onSubmit,
}: FineFormProps) {
  const { t, i18n } = useTranslation('common')
  const { t: tBr } = useTranslation('borrowRecord')
  const { t: tPc } = useTranslation('physicalCopyEnums')
  const [formData, setFormData] = useState<CreateFineRequest>(initialFormData)

  useEffect(() => {
    if (!open) {
      return
    }
    if (fine) {
      setFormData({
        borrowId: fine.borrowId,
        fineAmount: fine.fineAmount,
        fineDate: fine.fineDate,
        reason: fine.reason,
        status: fine.status,
        paymentDate: fine.paymentDate,
      })
      return
    }
    if (initialDraft && initialDraft.borrowId) {
      setFormData({
        ...initialFormData,
        borrowId: initialDraft.borrowId,
        fineAmount: initialDraft.fineAmount ?? 0,
        fineDate: initialDraft.fineDate ?? initialFormData.fineDate,
        reason: initialDraft.reason ?? '',
        status: initialDraft.status ?? 'unpaid',
        paymentDate: initialDraft.paymentDate,
      })
      return
    }
    setFormData(initialFormData)
  }, [open, fine, initialDraft])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleClose = () => {
    setFormData(initialFormData)
    onOpenChange(false)
  }

  
  const getReaderInfo = () => {
    const reader = fine?.borrow?.reader || fine?.reader
    return reader
  }

  const copy = fine?.borrow?.copy

  const copyReferencePriceDisplay = useMemo(() => {
    const ref = physicalCopyFineReferenceAmount(copy)
    if (ref == null) return '—'
    const locale = i18n.language?.startsWith('vi') ? 'vi-VN' : 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(ref)
  }, [copy, i18n.language])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {fine ? t('fines.edit') : t('fines.addNew')}
          </SheetTitle>
          <SheetDescription>
            {fine
              ? t('fines.editDescription')
              : t('fines.addDescription')}
          </SheetDescription>
        </SheetHeader>

        
        {fine && (
          <div className="grid gap-4 py-4 border-b mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t('fines.reader')}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t('users.fullName')}:</span>
                  <span className="font-medium">{getReaderInfo()?.fullName || '-'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t('users.cardNumber')}:</span>
                  <span className="font-mono text-sm">{getReaderInfo()?.cardNumber || '-'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{tBr('physicalCopy')}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{tBr('book')}:</span>
                  <span className="font-medium">
                    {copy?.book?.title || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{tBr('barcode')}:</span>
                  <span className="font-mono text-sm">
                    {copy?.barcode || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{tBr('location')}:</span>
                  <span className="text-sm">
                    {copy?.location?.name || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {tBr('copyReferencePrice')}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {copyReferencePriceDisplay}
                  </span>
                </div>
                {copy?.currentCondition ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500 shrink-0">
                      {tBr('condition')}:
                    </span>
                    <span className="text-sm text-right">
                      {tPc(`condition.${copy.currentCondition}`, {
                        defaultValue: copy.currentCondition,
                      })}
                    </span>
                  </div>
                ) : null}
                {copy?.conditionDetails ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500 shrink-0">
                      {tBr('conditionDetailsReadonly')}:
                    </span>
                    <span className="text-sm text-right">
                      {copy.conditionDetails}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            

            <div className="grid gap-2">
              <Label htmlFor="fineAmount">{t('fines.fineAmount')} *</Label>
              <Input
                id="fineAmount"
                type="number"
                value={formData.fineAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fineAmount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder={t('fines.fineAmountPlaceholder')}
                min={0}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="reason">{t('fines.reason')} *</Label>
              <Input
                id="reason"
                type="text"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target.value })
                }
                placeholder={t('fines.reasonPlaceholder')}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="fineDate">{t('fines.fineDate')}</Label>
            <Input
              id="fineDate"
              type="date"
              value={fineDateToInputValue(formData.fineDate)}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fineDate: new Date(e.target.value).toISOString(),
                })
              }
            />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t('fines.status')} *</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'unpaid' | 'paid') =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t('fines.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">{t('fines.unpaid')}</SelectItem>
                  <SelectItem value="paid">{t('fines.paid')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.status === 'paid' && (
              <div className="grid gap-2">
                <Label htmlFor="paymentDate">{t('fines.paymentDate')}</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={fineDateToInputValue(formData.paymentDate)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paymentDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : undefined,
                    })
                  }
                />
              </div>
            )}
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