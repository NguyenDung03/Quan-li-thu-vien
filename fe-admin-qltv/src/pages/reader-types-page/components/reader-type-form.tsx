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
import type { ReaderType, CreateReaderTypeRequest } from '@/types/reader-type.types'

interface ReaderTypeFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  readerType: ReaderType | null
  isSubmitting?: boolean
  onSubmit: (data: CreateReaderTypeRequest) => Promise<void>
}

const initialFormData: CreateReaderTypeRequest = {
  typeName: '',
  maxBorrowLimit: 5,
  borrowDurationDays: 30,
}

export function ReaderTypeForm({
  open,
  onOpenChange,
  readerType,
  isSubmitting = false,
  onSubmit,
}: ReaderTypeFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateReaderTypeRequest>(initialFormData)

  useEffect(() => {
    if (readerType) {
      setFormData({
        typeName: readerType.typeName,
        maxBorrowLimit: readerType.maxBorrowLimit,
        borrowDurationDays: readerType.borrowDurationDays,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [readerType])

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>
            {readerType ? t('readerTypes.edit') : t('readerTypes.addNew')}
          </SheetTitle>
          <SheetDescription>
            {readerType
              ? t('readerTypes.editDescription')
              : t('readerTypes.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="typeName" className="text-sm font-medium">
                {t('readerTypes.name')} *
              </label>
              <input
                id="typeName"
                type="text"
                value={formData.typeName}
                onChange={(e) => setFormData({ ...formData, typeName: e.target.value })}
                placeholder={t('readerTypes.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="maxBorrowLimit" className="text-sm font-medium">
                  {t('readerTypes.maxBorrowLimit')}
                </label>
                <input
                  id="maxBorrowLimit"
                  type="number"
                  value={formData.maxBorrowLimit}
                  onChange={(e) => setFormData({ ...formData, maxBorrowLimit: parseInt(e.target.value) || 0 })}
                  min={1}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="borrowDurationDays" className="text-sm font-medium">
                  {t('readerTypes.maxBorrowDays')}
                </label>
                <input
                  id="borrowDurationDays"
                  type="number"
                  value={formData.borrowDurationDays}
                  onChange={(e) => setFormData({ ...formData, borrowDurationDays: parseInt(e.target.value) || 0 })}
                  min={1}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
            </div>
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