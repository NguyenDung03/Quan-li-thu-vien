import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  searchPlaceholder?: string
  showSearch?: boolean
  searchValue?: string
  onSearchChange?: (value: string) => void
  onSearchSubmit?: () => void
  showAddButton?: boolean
  addButtonLabel?: string
  onAddClick?: () => void
  children?: ReactNode
}

export function PageHeader({
  title,
  description,
  searchPlaceholder = 'Tìm kiếm...',
  showSearch = true,
  searchValue = '',
  onSearchChange,
  onSearchSubmit,
  showAddButton = true,
  addButtonLabel = 'Thêm mới',
  onAddClick,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showSearch && onSearchChange && onSearchSubmit && (
          <div className="flex items-center gap-2">
            <Input
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit()}
              placeholder={searchPlaceholder}
              className="w-64 h-10"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onSearchSubmit}
              className="h-10 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </Button>
          </div>
        )}
        {children}
        {showAddButton && onAddClick && (
          <Button onClick={onAddClick} className="h-10 cursor-pointer">
            <span className="mr-2">+</span>
            {addButtonLabel}
          </Button>
        )}
      </div>
    </div>
  )
}