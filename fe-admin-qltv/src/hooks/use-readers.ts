import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readerApi } from '@/apis/reader.api'
import type {
  GetReadersParams,
  CreateReaderRequest,
  UpdateReaderRequest,
} from '@/types/reader.types'


export const readerKeys = {
  all: ['readers'] as const,
  lists: () => [...readerKeys.all, 'list'] as const,
  list: (params: GetReadersParams) => [...readerKeys.lists(), params] as const,
  details: () => [...readerKeys.all, 'detail'] as const,
  detail: (id: string) => [...readerKeys.details(), id] as const,
  byUser: (userId: string) => [...readerKeys.all, 'byUser', userId] as const,
}


export const useReaders = (params: GetReadersParams) => {
  return useQuery({
    queryKey: readerKeys.list(params),
    queryFn: () => readerApi.getReaders(params),
  })
}

export const useReader = (id: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: readerKeys.detail(id),
    queryFn: () => readerApi.getReaderById(id),
    enabled: !!id && (options?.enabled ?? true),
  })
}

export const useReaderByUserId = (userId: string) => {
  return useQuery({
    queryKey: readerKeys.byUser(userId),
    queryFn: () => readerApi.getReaderByUserId(userId),
    enabled: !!userId,
  })
}

export const useCreateReader = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReaderRequest) => readerApi.createReader(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() })
    },
  })
}

export const useUpdateReader = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReaderRequest }) =>
      readerApi.updateReader(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() })
      queryClient.invalidateQueries({ queryKey: readerKeys.detail(variables.id) })
    },
  })
}

export const useDeleteReader = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => readerApi.deleteReader(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerKeys.lists() })
    },
  })
}
