import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fineApi } from '@/apis/fine.api'
import type {
  GetFinesParams,
  CreateFineRequest,
  UpdateFineRequest,
  UpdateFineRulesRequest,
} from '@/types/fine.types'


export const fineKeys = {
  all: ['fines'] as const,
  lists: () => [...fineKeys.all, 'list'] as const,
  list: (params: GetFinesParams) => [...fineKeys.lists(), params] as const,
  details: () => [...fineKeys.all, 'detail'] as const,
  detail: (id: string) => [...fineKeys.details(), id] as const,
  rules: () => [...fineKeys.all, 'rules'] as const,
}


export const useFines = (params: GetFinesParams) => {
  return useQuery({
    queryKey: fineKeys.list(params),
    queryFn: () => fineApi.getFines(params),
  })
}

export const useFine = (id: string) => {
  return useQuery({
    queryKey: fineKeys.detail(id),
    queryFn: () => fineApi.getFineById(id),
    enabled: !!id,
  })
}

export const useCreateFine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateFineRequest) => fineApi.createFine(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fineKeys.lists() })
    },
  })
}

export const useUpdateFine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateFineRequest }) =>
      fineApi.updateFine(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: fineKeys.lists() })
      queryClient.invalidateQueries({ queryKey: fineKeys.detail(variables.id) })
    },
  })
}

export const useDeleteFine = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => fineApi.deleteFine(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fineKeys.lists() })
    },
  })
}

export const useFineRules = () => {
  return useQuery({
    queryKey: fineKeys.rules(),
    queryFn: () => fineApi.getFineRules(),
  })
}

export const useUpdateFineRules = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateFineRulesRequest) =>
      fineApi.updateFineRules(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fineKeys.rules() })
    },
  })
}