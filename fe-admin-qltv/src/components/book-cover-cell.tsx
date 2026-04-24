import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BookCoverSource =
  | {
      coverImage?: string | null
      coverImageEntity?: { cloudinaryUrl?: string | null } | null
    }
  | null
  | undefined

export function getBookCoverUrl(source: BookCoverSource): string | undefined {
  const direct = source?.coverImage?.trim()
  if (direct) return direct
  const fromEntity = source?.coverImageEntity?.cloudinaryUrl?.trim()
  return fromEntity || undefined
}

export function BookCoverCell({
  url,
  alt,
  className,
}: {
  url?: string | null
  alt?: string
  className?: string
}) {
  if (url) {
    return (
      <div
        className={cn(
          'relative h-24 w-16 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-muted dark:border-slate-600',
          className,
        )}
      >
        <img
          src={url}
          alt={alt || ''}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }
  return (
    <div
      className={cn(
        'flex h-24 w-16 shrink-0 items-center justify-center rounded-md border border-dashed border-slate-200 bg-muted/50 text-muted-foreground dark:border-slate-600',
        className,
      )}
      aria-hidden
    >
      <BookOpen className="h-6 w-6 opacity-40" />
    </div>
  )
}
