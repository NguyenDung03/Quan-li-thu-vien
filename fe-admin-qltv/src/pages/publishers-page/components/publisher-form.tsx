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
import type { Publisher, CreatePublisherRequest } from '@/types/publisher.types'

interface PublisherFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  publisher: Publisher | null
  isSubmitting?: boolean
  onSubmit: (data: CreatePublisherRequest) => Promise<void>
}

const initialFormData: CreatePublisherRequest = {
  publisherName: '',
  address: '',
  phone: '',
  email: '',
}

export function PublisherForm({
  open,
  onOpenChange,
  publisher,
  isSubmitting = false,
  onSubmit,
}: PublisherFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreatePublisherRequest>(initialFormData)

  useEffect(() => {
    if (publisher) {
      setFormData({
        publisherName: publisher.publisherName,
        address: publisher.address || '',
        phone: publisher.phone || '',
        email: publisher.email || '',
      })
    } else {
      setFormData(initialFormData)
    }
  }, [publisher, initialFormData])

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
            {publisher ? t('publishers.edit') : t('publishers.addNew')}
          </SheetTitle>
          <SheetDescription>
            {publisher
              ? t('publishers.editDescription')
              : t('publishers.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="publisherName" className="text-sm font-medium">
                {t('publishers.name')} *
              </label>
              <input
                id="publisherName"
                type="text"
                value={formData.publisherName}
                onChange={(e) => setFormData({ ...formData, publisherName: e.target.value })}
                placeholder={t('publishers.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="address" className="text-sm font-medium">
                {t('publishers.address')}
              </label>
              <input
                id="address"
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={t('publishers.addressPlaceholder')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="phone" className="text-sm font-medium">
                  {t('publishers.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('publishers.phonePlaceholder')}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">
                  {t('publishers.email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('publishers.emailPlaceholder')}
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