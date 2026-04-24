import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
  success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

interface StatusBadgeProps {
  status: string
  trueLabel?: string
  falseLabel?: string
  mapping?: Record<string, { label: string; variant: BadgeVariant }>
}

export function StatusBadge({ status, trueLabel, falseLabel, mapping }: StatusBadgeProps) {
  
  if (mapping && mapping[status]) {
    return <Badge variant={mapping[status].variant}>{mapping[status].label}</Badge>
  }

  
  const statusLower = String(status).toLowerCase()
  if (statusLower === 'true' || statusLower === 'active') {
    return <Badge variant="success">{trueLabel || 'Hoạt động'}</Badge>
  }
  if (statusLower === 'false' || statusLower === 'inactive') {
    return <Badge variant="danger">{falseLabel || 'Không hoạt động'}</Badge>
  }

  
  return <Badge>{status}</Badge>
}