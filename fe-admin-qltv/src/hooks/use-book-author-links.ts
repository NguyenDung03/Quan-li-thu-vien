import { useQuery } from '@tanstack/react-query'
import { bookAuthorsLinkApi } from '@/apis/book-authors.api'
import type { GetBookAuthorsLinkParams } from '@/types/book-link.types'

export const bookAuthorLinkKeys = {
  all: ['book-author-links'] as const,
  list: (params: GetBookAuthorsLinkParams) => [...bookAuthorLinkKeys.all, params] as const,
}

export function useBookAuthorLinks(
  params: GetBookAuthorsLinkParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: bookAuthorLinkKeys.list(params),
    queryFn: () => bookAuthorsLinkApi.getBookAuthors(params),
    enabled: (options?.enabled ?? true) && !!params.bookId,
  })
}
