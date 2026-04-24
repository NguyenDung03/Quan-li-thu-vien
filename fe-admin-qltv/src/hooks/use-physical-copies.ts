import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { physicalCopyApi } from '@/apis/physical-copy.api'
import { borrowRecordKeys } from '@/hooks/use-borrow-records'
import type {
  GetPhysicalCopiesParams,
  CreatePhysicalCopyRequest,
  UpdatePhysicalCopyRequest,
} from '@/types/physical-copy.types'


export const physicalCopyKeys = {
  all: ['physicalCopies'] as const,
  lists: () => [...physicalCopyKeys.all, 'list'] as const,
  list: (params: GetPhysicalCopiesParams) => [...physicalCopyKeys.lists(), params] as const,
  details: () => [...physicalCopyKeys.all, 'detail'] as const,
  detail: (id: string) => [...physicalCopyKeys.details(), id] as const,
}


export const usePhysicalCopies = (params: GetPhysicalCopiesParams) => {
  return useQuery({
    queryKey: physicalCopyKeys.list(params),
    queryFn: () => physicalCopyApi.getPhysicalCopies(params),
  })
}

export const usePhysicalCopy = (id: string) => {
  return useQuery({
    queryKey: physicalCopyKeys.detail(id),
    queryFn: () => physicalCopyApi.getPhysicalCopyById(id),
    enabled: !!id,
  })
}

export const useCreatePhysicalCopy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePhysicalCopyRequest) =>
      physicalCopyApi.createPhysicalCopy(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: physicalCopyKeys.lists() })
    },
  })
}

export const useUpdatePhysicalCopy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePhysicalCopyRequest }) =>
      physicalCopyApi.updatePhysicalCopy(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: physicalCopyKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: physicalCopyKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: borrowRecordKeys.all })
    },
  })
}

export const useDeletePhysicalCopy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => physicalCopyApi.deletePhysicalCopy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: physicalCopyKeys.lists() })
    },
  })
}