import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Eye } from 'lucide-react'

interface ActionButtonsProps {
  onEdit?: () => void
  onDelete?: () => void
  onView?: () => void
  editLabel?: string
  deleteLabel?: string
  viewLabel?: string
  showEdit?: boolean
  showDelete?: boolean
  showView?: boolean
  children?: ReactNode
}

export function ActionButtons({
  onEdit,
  onDelete,
  onView,
  editLabel = 'Sửa',
  deleteLabel = 'Xóa',
  viewLabel = 'Xem',
  showEdit = true,
  showDelete = true,
  showView = false,
  children,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      {showView && onView && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onView}
          className="cursor-pointer h-8 w-8"
          title={viewLabel}
        >
          <Eye className="w-3.5 h-3.5" />
        </Button>
      )}
      {showEdit && onEdit && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
          className="cursor-pointer h-8 w-8"
          title={editLabel}
        >
          <Pencil className="w-3.5 h-3.5" />
        </Button>
      )}
      {showDelete && onDelete && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="cursor-pointer h-8 w-8"
          title={deleteLabel}
        >
          <Trash2 className="w-3.5 h-3.5 text-red-500" />
        </Button>
      )}
      {children}
    </div>
  )
}