import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ebookApi } from '@/apis/ebook.api'
import type {
  GetEbooksParams,
  CreateEbookRequest,
  UpdateEbookRequest,
} from '@/types/ebook.types'


export const ebookKeys = {
  all: ['ebooks'] as const,
  lists: () => [...ebookKeys.all, 'list'] as const,
  list: (params: GetEbooksParams) => [...ebookKeys.lists(), params] as const,
  details: () => [...ebookKeys.all, 'detail'] as const,
  detail: (id: string) => [...ebookKeys.details(), id] as const,
}


export const useEbooks = (params: GetEbooksParams) => {
  return useQuery({
    queryKey: ebookKeys.list(params),
    queryFn: () => ebookApi.getEbooks(params),
  })
}

export const useEbook = (id: string) => {
  return useQuery({
    queryKey: ebookKeys.detail(id),
    queryFn: () => ebookApi.getEbookById(id),
    enabled: !!id,
  })
}

export const useCreateEbook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateEbookRequest) => ebookApi.createEbook(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() })
    },
  })
}

export const useUpdateEbook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEbookRequest }) =>
      ebookApi.updateEbook(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() })
      queryClient.invalidateQueries({
        queryKey: ebookKeys.detail(variables.id),
      })
    },
  })
}

export const useDeleteEbook = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => ebookApi.deleteEbook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ebookKeys.lists() })
    },
  })
}