import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { gradeLevelApi } from '@/apis/grade-level.api'
import type { GetGradeLevelsParams, CreateGradeLevelRequest, UpdateGradeLevelRequest, GradeLevelsResponse } from '@/types/grade-level.types'

export const gradeLevelKeys = {
  all: ['gradeLevels'] as const,
  lists: () => [...gradeLevelKeys.all, 'list'] as const,
  list: (params: GetGradeLevelsParams) => [...gradeLevelKeys.lists(), params] as const,
  details: () => [...gradeLevelKeys.all, 'detail'] as const,
  detail: (id: string) => [...gradeLevelKeys.details(), id] as const,
}

export const useGradeLevels = (
  params: GetGradeLevelsParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: gradeLevelKeys.list(params),
    queryFn: () => gradeLevelApi.getGradeLevels(params),
    enabled: options?.enabled ?? true,
  })
}

export const useGradeLevelById = (id: string) => {
  return useQuery({
    queryKey: gradeLevelKeys.detail(id),
    queryFn: () => gradeLevelApi.getGradeLevelById(id),
    enabled: !!id,
  })
}

export const useCreateGradeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateGradeLevelRequest) => gradeLevelApi.createGradeLevel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.lists() })
    },
  })
}

export const useUpdateGradeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGradeLevelRequest }) =>
      gradeLevelApi.updateGradeLevel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.lists() })
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.detail(id) })
    },
  })
}

export const useDeleteGradeLevel = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => gradeLevelApi.deleteGradeLevel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gradeLevelKeys.lists() })
    },
  })
}

export const useInfiniteGradeLevels = (params: Omit<GetGradeLevelsParams, 'page' | 'limit'>) => {
  const DEFAULT_LIMIT = 20

  return useInfiniteQuery({
    queryKey: [...gradeLevelKeys.lists(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      gradeLevelApi.getGradeLevels({ ...params, page: pageParam as number, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage: GradeLevelsResponse) =>
      lastPage.meta.totalItems > lastPage.meta.page * DEFAULT_LIMIT ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}
