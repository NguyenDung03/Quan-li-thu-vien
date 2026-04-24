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
import type { GradeLevel, CreateGradeLevelRequest } from '@/types/grade-level.types'

interface GradeLevelFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  gradeLevel: GradeLevel | null
  isSubmitting?: boolean
  onSubmit: (data: CreateGradeLevelRequest) => Promise<void>
}

const initialFormData: CreateGradeLevelRequest = {
  name: '',
  description: '',
  orderNo: 0,
}

export function GradeLevelForm({
  open,
  onOpenChange,
  gradeLevel,
  isSubmitting = false,
  onSubmit,
}: GradeLevelFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateGradeLevelRequest>(initialFormData)

  useEffect(() => {
    if (gradeLevel) {
      setFormData({
        name: gradeLevel.name,
        description: gradeLevel.description || '',
        orderNo: gradeLevel.orderNo,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [gradeLevel])

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
            {gradeLevel ? t('gradeLevels.edit') : t('gradeLevels.addNew')}
          </SheetTitle>
          <SheetDescription>
            {gradeLevel
              ? t('gradeLevels.editDescription')
              : t('gradeLevels.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('gradeLevels.name')} *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('gradeLevels.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                {t('gradeLevels.description')}
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('gradeLevels.descriptionPlaceholder')}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="orderNo" className="text-sm font-medium">
                {t('gradeLevels.orderNo')} *
              </label>
              <input
                id="orderNo"
                type="number"
                value={formData.orderNo}
                onChange={(e) => setFormData({ ...formData, orderNo: Number(e.target.value) })}
                placeholder={t('gradeLevels.orderNoPlaceholder')}
                required
                min={0}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
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