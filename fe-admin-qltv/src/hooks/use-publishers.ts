import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { publisherApi } from '@/apis/publisher.api'
import type { GetPublishersParams, CreatePublisherRequest, UpdatePublisherRequest } from '@/types/publisher.types'

export const publisherKeys = {
  all: ['publishers'] as const,
  lists: () => [...publisherKeys.all, 'list'] as const,
  list: (params: GetPublishersParams) => [...publisherKeys.lists(), params] as const,
  details: () => [...publisherKeys.all, 'detail'] as const,
  detail: (id: string) => [...publisherKeys.details(), id] as const,
}

export const usePublishers = (
  params: GetPublishersParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: publisherKeys.list(params),
    queryFn: () => publisherApi.getPublishers(params),
    enabled: options?.enabled ?? true,
  })
}

export const usePublisherById = (id: string) => {
  return useQuery({
    queryKey: publisherKeys.detail(id),
    queryFn: () => publisherApi.getPublisherById(id),
    enabled: !!id,
  })
}

export const useCreatePublisher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePublisherRequest) => publisherApi.createPublisher(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publisherKeys.lists() })
    },
  })
}

export const useUpdatePublisher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePublisherRequest }) =>
      publisherApi.updatePublisher(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: publisherKeys.lists() })
      queryClient.invalidateQueries({ queryKey: publisherKeys.detail(id) })
    },
  })
}

export const useDeletePublisher = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => publisherApi.deletePublisher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: publisherKeys.lists() })
    },
  })
}

export const useInfinitePublishers = (params: Omit<GetPublishersParams, 'page' | 'limit'>) => {
  const DEFAULT_LIMIT = 20

  return useInfiniteQuery({
    queryKey: [...publisherKeys.lists(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      publisherApi.getPublishers({ ...params, page: pageParam, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.totalItems > lastPage.meta.page * DEFAULT_LIMIT ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}
