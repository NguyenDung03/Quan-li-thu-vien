import { useState } from 'react'
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
import type { Author, CreateAuthorRequest } from '@/types/author.types'
import { countries } from '@/data/countries'

interface AuthorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  author: Author | null
  isSubmitting?: boolean
  onSubmit: (data: CreateAuthorRequest) => Promise<void>
}

const initialFormData: CreateAuthorRequest = {
  authorName: '',
  bio: '',
  nationality: '',
}

export function AuthorForm({
  open,
  onOpenChange,
  author,
  isSubmitting = false,
  onSubmit,
}: AuthorFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateAuthorRequest>(
    author
      ? {
          authorName: author.authorName,
          bio: author.bio || '',
          nationality: author.nationality || '',
        }
      : initialFormData
  )

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
            {author ? t('authors.edit') : t('authors.addNew')}
          </SheetTitle>
          <SheetDescription>
            {author
              ? t('authors.editDescription')
              : t('authors.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="authorName" className="text-sm font-medium">
                {t('authors.name')} *
              </label>
              <input
                id="authorName"
                type="text"
                value={formData.authorName}
                onChange={(e) =>
                  setFormData({ ...formData, authorName: e.target.value })
                }
                placeholder={t('authors.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="bio" className="text-sm font-medium">
                {t('authors.bio')}
              </label>
              <textarea
                id="bio"
                value={formData.bio || ''}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder={t('authors.bioPlaceholder')}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="nationality" className="text-sm font-medium">
                {t('authors.nationality') || 'Quốc tịch'}
              </label>
              <select
                id="nationality"
                value={formData.nationality || ''}
                onChange={(e) =>
                  setFormData({ ...formData, nationality: e.target.value })
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">
                  {t('authors.selectNationality') || 'Chọn quốc tịch'}
                </option>
                {countries.map((country) => (
                  <option key={country.value} value={country.value}>
                    {country.label}
                  </option>
                ))}
              </select>
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