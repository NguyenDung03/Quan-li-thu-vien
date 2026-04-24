import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { locationApi } from '@/apis/location.api'
import type { GetLocationsParams, CreateLocationRequest, UpdateLocationRequest } from '@/types/location.types'

export const locationKeys = {
  all: ['locations'] as const,
  lists: () => [...locationKeys.all, 'list'] as const,
  list: (params: GetLocationsParams) => [...locationKeys.lists(), params] as const,
  details: () => [...locationKeys.all, 'detail'] as const,
  detail: (id: string) => [...locationKeys.details(), id] as const,
}

export const useLocations = (
  params: GetLocationsParams,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: locationKeys.list(params),
    queryFn: () => locationApi.getLocations(params),
    enabled: options?.enabled ?? true,
  })
}

export const useLocationById = (id: string) => {
  return useQuery({
    queryKey: locationKeys.detail(id),
    queryFn: () => locationApi.getLocationById(id),
    enabled: !!id,
  })
}

export const useCreateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateLocationRequest) => locationApi.createLocation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() })
    },
  })
}

export const useUpdateLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLocationRequest }) =>
      locationApi.updateLocation(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() })
      queryClient.invalidateQueries({ queryKey: locationKeys.detail(id) })
    },
  })
}

export const useDeleteLocation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => locationApi.deleteLocation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationKeys.lists() })
    },
  })
}

export const useInfiniteLocations = (params: Omit<GetLocationsParams, 'page' | 'limit'>) => {
  const DEFAULT_LIMIT = 20

  return useInfiniteQuery({
    queryKey: [...locationKeys.lists(), params] as const,
    queryFn: ({ pageParam = 1 }) =>
      locationApi.getLocations({ ...params, page: pageParam, limit: DEFAULT_LIMIT }),
    getNextPageParam: (lastPage) =>
      lastPage.meta.totalItems > lastPage.meta.page * DEFAULT_LIMIT ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
  })
}
