import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { authorApi } from '@/apis/author.api'
import type {
  GetAuthorsParams,
  CreateAuthorRequest,
  UpdateAuthorRequest,
  AuthorsResponse,
} from '@/types/author.types'


export const authorKeys = {
  all: ['authors'] as const,
  lists: () => [...authorKeys.all, 'list'] as const,
  list: (params: GetAuthorsParams) => [...authorKeys.lists(), params] as const,
  details: () => [...authorKeys.all, 'detail'] as const,
  detail: (id: string) => [...authorKeys.details(), id] as const,
}


export const useAuthors = (
  params: GetAuthorsParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: authorKeys.list(params),
    queryFn: () => authorApi.getAuthors(params),
    enabled: options?.enabled ?? true,
  })
}

export const useAuthor = (id: string) => {
  return useQuery({
    queryKey: authorKeys.detail(id),
    queryFn: () => authorApi.getAuthorById(id),
    enabled: !!id,
  })
}

export const useCreateAuthor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateAuthorRequest) => authorApi.createAuthor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() })
    },
  })
}

export const useUpdateAuthor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAuthorRequest }) =>
      authorApi.updateAuthor(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() })
      queryClient.invalidateQueries({ queryKey: authorKeys.detail(variables.id) })
    },
  })
}

export const useDeleteAuthor = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => authorApi.deleteAuthor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authorKeys.lists() })
    },
  })
}

export const useInfiniteAuthors = (params: Omit<GetAuthorsParams, 'page' | 'limit'>) => {
  const DEFAULT_LIMIT = 20

  return useInfiniteQuery({
    queryKey: [...authorKeys.lists(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      authorApi.getAuthors({ ...params, page: pageParam as number, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage: AuthorsResponse) =>
      lastPage.meta.totalItems > lastPage.meta.page * DEFAULT_LIMIT ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}
