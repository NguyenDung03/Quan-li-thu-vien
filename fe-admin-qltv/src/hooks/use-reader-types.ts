import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { readerTypeApi } from '@/apis/reader-type.api'
import type {
  GetReaderTypesParams,
  CreateReaderTypeRequest,
  UpdateReaderTypeRequest,
} from '@/types/reader-type.types'


export const readerTypeKeys = {
  all: ['readerTypes'] as const,
  lists: () => [...readerTypeKeys.all, 'list'] as const,
  list: (params: GetReaderTypesParams) => [...readerTypeKeys.lists(), params] as const,
  details: () => [...readerTypeKeys.all, 'detail'] as const,
  detail: (id: string) => [...readerTypeKeys.details(), id] as const,
}


export const useReaderTypes = (params: GetReaderTypesParams) => {
  return useQuery({
    queryKey: readerTypeKeys.list(params),
    queryFn: () => readerTypeApi.getReaderTypes(params),
  })
}

export const useReaderType = (id: string) => {
  return useQuery({
    queryKey: readerTypeKeys.detail(id),
    queryFn: () => readerTypeApi.getReaderTypeById(id),
    enabled: !!id,
  })
}

export const useCreateReaderType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateReaderTypeRequest) => readerTypeApi.createReaderType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerTypeKeys.lists() })
    },
  })
}

export const useUpdateReaderType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateReaderTypeRequest }) =>
      readerTypeApi.updateReaderType(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: readerTypeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: readerTypeKeys.detail(variables.id) })
    },
  })
}

export const useDeleteReaderType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => readerTypeApi.deleteReaderType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: readerTypeKeys.lists() })
    },
  })
}
