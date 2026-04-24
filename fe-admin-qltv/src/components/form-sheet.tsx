import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Check, ChevronsUpDown } from 'lucide-react'

export type FormField = {
  name: string
  label: string
  type: 'text' | 'number' | 'email' | 'password' | 'date' | 'tel' | 'textarea' | 'select' | 'combobox'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
  disabled?: boolean
  readOnly?: boolean
  rows?: number
  comboboxData?: { value: string; label: string }[]
}

interface FormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fields: FormField[]
  values: Record<string, unknown>
  onChange: (field: string, value: unknown) => void
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isSubmitting?: boolean
  submitLabel?: string
  cancelLabel?: string
  children?: ReactNode
}

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  isSubmitting = false,
  submitLabel,
  cancelLabel,
  children,
}: FormSheetProps) {
  const { t } = useTranslation('common')
  const [comboboxOpen, setComboboxOpen] = useState<Record<string, boolean>>({})

  const handleComboboxOpen = (fieldName: string, open: boolean) => {
    setComboboxOpen(prev => ({ ...prev, [fieldName]: open }))
  }

  const renderField = (field: FormField) => {
    const value = values[field.name]

    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            id={field.name}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={field.rows || 3}
            disabled={field.disabled}
            className={field.readOnly ? 'bg-slate-50 dark:bg-slate-900' : ''}
          />
        )

      case 'select':
        return (
          <Select
            value={(value as string) || ''}
            onValueChange={(val) => onChange(field.name, val)}
            disabled={field.disabled}
          >
            <SelectTrigger id={field.name} className="cursor-pointer">
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value} className="cursor-pointer">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'combobox':
        return (
          <Popover
            open={comboboxOpen[field.name]}
            onOpenChange={(open) => handleComboboxOpen(field.name, open)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between h-10 cursor-pointer"
              >
                {value
                  ? field.comboboxData?.find((item) => item.value === value)?.label
                  : field.placeholder || 'Chọn...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0">
              <Command>
                <CommandInput placeholder="Tìm kiếm..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy.</CommandEmpty>
                  <CommandGroup>
                    {field.comboboxData?.map((item) => (
                      <CommandItem
                        key={item.value}
                        value={item.label}
                        onSelect={() => {
                          onChange(field.name, item.value)
                          handleComboboxOpen(field.name, false)
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            value === item.value ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                        {item.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )

      default:
        return (
          <Input
            id={field.name}
            type={field.type}
            value={(value as string) || ''}
            onChange={(e) => onChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            disabled={field.disabled}
            readOnly={field.readOnly}
            className={field.readOnly ? 'bg-slate-50 dark:bg-slate-900' : ''}
          />
        )
    }
  }

  
  const groupedFields: FormField[][] = []
  let currentRow: FormField[] = []

  fields.forEach((field, index) => {
    currentRow.push(field)
    
    const nextField = fields[index + 1]
    const shouldBreak = !nextField ||
      nextField.type === 'textarea' ||
      field.type === 'textarea' ||
      field.name.includes('Id') && !nextField.name.includes('Id')

    if (shouldBreak || currentRow.length === 2) {
      groupedFields.push(currentRow)
      currentRow = []
    }
  })

  if (currentRow.length > 0) {
    groupedFields.push(currentRow)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {groupedFields.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={row.length > 1 ? 'grid grid-cols-2 gap-4' : 'grid gap-2'}
              >
                {row.map((field) => (
                  <div
                    key={field.name}
                    className={`grid gap-2 ${row.length > 1 ? '' : 'col-span-2'}`}
                  >
                    <Label htmlFor={field.name}>
                      {field.label} {field.required && '*'}
                    </Label>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            ))}
            {children}
          </div>
          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              {cancelLabel || t('common.cancel')}
            </Button>
            <Button type="submit" disabled={isSubmitting} className="cursor-pointer">
              {isSubmitting ? t('common.loading') : submitLabel || t('common.save')}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
