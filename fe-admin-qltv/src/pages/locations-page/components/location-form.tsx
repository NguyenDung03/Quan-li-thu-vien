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
import type { Location, CreateLocationRequest } from '@/types/location.types'

interface LocationFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  location: Location | null
  isSubmitting?: boolean
  onSubmit: (data: CreateLocationRequest) => Promise<void>
}

const initialFormData: CreateLocationRequest = {
  name: '',
  slug: '',
  description: '',
  floor: undefined,
  section: '',
  shelf: '',
  isActive: true,
}

export function LocationForm({
  open,
  onOpenChange,
  location,
  isSubmitting = false,
  onSubmit,
}: LocationFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateLocationRequest>(initialFormData)

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name,
        slug: location.slug,
        description: location.description || '',
        floor: location.floor,
        section: location.section || '',
        shelf: location.shelf || '',
        isActive: location.isActive,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      floor: formData.floor || undefined,
      description: formData.description || undefined,
      section: formData.section || undefined,
      shelf: formData.shelf || undefined,
    }
    await onSubmit(submitData)
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
            {location ? t('locations.edit') : t('locations.addNew')}
          </SheetTitle>
          <SheetDescription>
            {location
              ? t('locations.editDescription')
              : t('locations.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('locations.name')} *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('locations.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="slug" className="text-sm font-medium">
                {t('locations.slug')} *
              </label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder={t('locations.slugPlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                {t('locations.description')}
              </label>
              <textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('locations.descriptionPlaceholder')}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <label htmlFor="floor" className="text-sm font-medium">
                  {t('locations.floor')}
                </label>
                <input
                  id="floor"
                  type="number"
                  value={formData.floor || ''}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder={t('locations.floorPlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="section" className="text-sm font-medium">
                  {t('locations.section')}
                </label>
                <input
                  id="section"
                  type="text"
                  value={formData.section || ''}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  placeholder={t('locations.sectionPlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="shelf" className="text-sm font-medium">
                  {t('locations.shelf')}
                </label>
                <input
                  id="shelf"
                  type="text"
                  value={formData.shelf || ''}
                  onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                  placeholder={t('locations.shelfPlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
                {t('locations.isActive')}
              </label>
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