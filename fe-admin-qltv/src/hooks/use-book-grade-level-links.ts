import { useQuery } from '@tanstack/react-query'
import { bookGradeLevelsLinkApi } from '@/apis/book-grade-levels.api'
import type { GetBookGradeLevelsLinkParams } from '@/types/book-link.types'

export const bookGradeLevelLinkKeys = {
  all: ['book-grade-level-links'] as const,
  list: (params: GetBookGradeLevelsLinkParams) => [...bookGradeLevelLinkKeys.all, params] as const,
}

export function useBookGradeLevelLinks(
  params: GetBookGradeLevelsLinkParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: bookGradeLevelLinkKeys.list(params),
    queryFn: () => bookGradeLevelsLinkApi.getBookGradeLevels(params),
    enabled: (options?.enabled ?? true) && !!params.bookId,
  })
}
