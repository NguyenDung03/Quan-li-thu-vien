import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { bookCategoryApi } from '@/apis/book-category.api'
import type { GetBookCategoriesParams, CreateBookCategoryRequest, UpdateBookCategoryRequest, BookCategoriesResponse } from '@/types/book-category.types'

export const bookCategoryKeys = {
  all: ['bookCategories'] as const,
  lists: () => [...bookCategoryKeys.all, 'list'] as const,
  list: (params: GetBookCategoriesParams) => [...bookCategoryKeys.lists(), params] as const,
  details: () => [...bookCategoryKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookCategoryKeys.details(), id] as const,
}

export const useBookCategories = (
  params: GetBookCategoriesParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: bookCategoryKeys.list(params),
    queryFn: () => bookCategoryApi.getBookCategories(params),
    enabled: options?.enabled ?? true,
  })
}

export const useBookCategoryById = (id: string) => {
  return useQuery({
    queryKey: bookCategoryKeys.detail(id),
    queryFn: () => bookCategoryApi.getBookCategoryById(id),
    enabled: !!id,
  })
}

export const useCreateBookCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookCategoryRequest) => bookCategoryApi.createBookCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookCategoryKeys.lists() })
    },
  })
}

export const useUpdateBookCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookCategoryRequest }) =>
      bookCategoryApi.updateBookCategory(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: bookCategoryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: bookCategoryKeys.detail(id) })
    },
  })
}

export const useDeleteBookCategory = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookCategoryApi.deleteBookCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookCategoryKeys.lists() })
    },
  })
}

export const useInfiniteBookCategories = (params: Omit<GetBookCategoriesParams, 'page' | 'limit'>) => {
  const DEFAULT_LIMIT = 20

  return useInfiniteQuery({
    queryKey: [...bookCategoryKeys.lists(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      bookCategoryApi.getBookCategories({ ...params, page: pageParam, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage: BookCategoriesResponse) =>
      lastPage.meta.totalItems > lastPage.meta.page * DEFAULT_LIMIT ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}
