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
import { Badge } from '@/components/ui/badge'
import type { Ebook, CreateEbookRequest } from '@/types/ebook.types'

interface EbookFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  ebook: Ebook | null
  isSubmitting?: boolean
  onSubmit: (data: CreateEbookRequest) => Promise<void>
}

const initialFormData: CreateEbookRequest = {
  bookId: '',
  filePath: '',
  fileSize: 0,
  fileFormat: '',
}

export function EbookForm({
  open,
  onOpenChange,
  ebook,
  isSubmitting = false,
  onSubmit,
}: EbookFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateEbookRequest>(initialFormData)

  useEffect(() => {
    if (ebook) {
      setFormData({
        bookId: ebook.bookId,
        filePath: ebook.filePath,
        fileSize: ebook.fileSize,
        fileFormat: ebook.fileFormat,
      })
    } else {
      setFormData(initialFormData)
    }
  }, [ebook])

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
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {ebook ? t('ebooks.edit') : t('ebooks.addNew')}
          </SheetTitle>
          <SheetDescription>
            {ebook
              ? t('ebooks.editDescription')
              : t('ebooks.addDescription')}
          </SheetDescription>
        </SheetHeader>

        
        {ebook && (
          <div className="grid gap-4 py-4 border-b mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t('ebooks.book')}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t('books.name')}:</span>
                  <span className="font-medium">{ebook.book?.title || '-'}</span>
                </div>
                {ebook.book?.isbn && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">{t('books.isbn')}:</span>
                    <span className="font-mono text-sm">{ebook.book.isbn}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {!ebook && (
              <div className="grid gap-2">
                <Label htmlFor="bookId">{t('ebooks.book')} *</Label>
                <Input
                  id="bookId"
                  type="text"
                  value={formData.bookId}
                  onChange={(e) =>
                    setFormData({ ...formData, bookId: e.target.value })
                  }
                  placeholder={t('ebooks.bookPlaceholder')}
                  required
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="filePath">{t('ebooks.filePath')} *</Label>
              <Input
                id="filePath"
                type="text"
                value={formData.filePath}
                onChange={(e) =>
                  setFormData({ ...formData, filePath: e.target.value })
                }
                placeholder={t('ebooks.filePathPlaceholder')}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fileSize">{t('ebooks.fileSize')} *</Label>
                <Input
                  id="fileSize"
                  type="number"
                  value={formData.fileSize}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fileSize: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder={t('ebooks.fileSizePlaceholder')}
                  min={0}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fileFormat">{t('ebooks.format')} *</Label>
                <Input
                  id="fileFormat"
                  type="text"
                  value={formData.fileFormat}
                  onChange={(e) =>
                    setFormData({ ...formData, fileFormat: e.target.value })
                  }
                  placeholder={t('ebooks.formatPlaceholder')}
                  required
                />
              </div>
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
