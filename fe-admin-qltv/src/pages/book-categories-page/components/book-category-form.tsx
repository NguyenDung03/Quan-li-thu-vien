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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Check, ChevronsUpDown, X } from 'lucide-react'
import type { BookCategory, CreateBookCategoryRequest } from '@/types/book-category.types'

interface BookCategoryFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: BookCategory | null
  categories: BookCategory[]
  isSubmitting?: boolean
  onSubmit: (data: CreateBookCategoryRequest) => Promise<void>
}

const initialFormData: CreateBookCategoryRequest = {
  name: '',
  parentId: '',
}

export function BookCategoryForm({
  open,
  onOpenChange,
  category,
  categories,
  isSubmitting = false,
  onSubmit,
}: BookCategoryFormProps) {
  const { t } = useTranslation('common')
  const [formData, setFormData] = useState<CreateBookCategoryRequest>(initialFormData)
  const [parentIdOpen, setParentIdOpen] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        parentId: category.parentId || '',
      })
    } else {
      setFormData(initialFormData)
    }
  }, [category])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const submitData = {
      ...formData,
      parentId: formData.parentId || undefined,
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
            {category ? t('bookCategories.edit') : t('bookCategories.addNew')}
          </SheetTitle>
          <SheetDescription>
            {category
              ? t('bookCategories.editDescription')
              : t('bookCategories.addDescription')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                {t('bookCategories.name')} *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('bookCategories.namePlaceholder')}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="parentId" className="text-sm font-medium">
                {t('bookCategories.parentId')}
              </label>
              <Popover open={parentIdOpen} onOpenChange={setParentIdOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between h-10 cursor-pointer"
                  >
                    {formData.parentId
                      ? categories.find((c) => c.id === formData.parentId)?.name
                      : t('bookCategories.parentIdPlaceholder') || 'Chọn danh mục cha'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Tìm kiếm..." />
                    <CommandList>
                      <CommandEmpty>Không tìm thấy.</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value=""
                          onSelect={() => {
                            setFormData({ ...formData, parentId: '' })
                            setParentIdOpen(false)
                          }}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Không chọn
                        </CommandItem>
                        {categories
                          .filter((c) => c.id !== category?.id)
                          .map((cat) => (
                            <CommandItem
                              key={cat.id}
                              value={cat.name}
                              onSelect={() => {
                                setFormData({ ...formData, parentId: cat.id })
                                setParentIdOpen(false)
                              }}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  formData.parentId === cat.id ? 'opacity-100' : 'opacity-0'
                                }`}
                              />
                              {cat.name}
                            </CommandItem>
                          ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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