import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { reservationApi } from '@/apis/reservation.api'
import {
  ReservationStatus,
  type Reservation,
  type GetReservationsParams,
  type CreateReservationRequest,
  type UpdateReservationRequest,
  type ReservationStatusType,
} from '@/types/reservation.types'

export type ReservationStatsSlice =
  | 'all'
  | ReservationStatusType

export const reservationKeys = {
  all: ['reservations'] as const,
  lists: () => [...reservationKeys.all, 'list'] as const,
  list: (params: GetReservationsParams) => [...reservationKeys.lists(), params] as const,
  details: () => [...reservationKeys.all, 'detail'] as const,
  detail: (id: string) => [...reservationKeys.details(), id] as const,
  stats: (slice: ReservationStatsSlice) =>
    [...reservationKeys.all, 'stats', slice] as const,
}

function invalidateReservationLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: reservationKeys.lists() })
  queryClient.invalidateQueries({ queryKey: [...reservationKeys.all, 'stats'] })
}

export function useReservationStats() {
  const slices: { slice: ReservationStatsSlice; status?: ReservationStatusType }[] = [
    { slice: 'all' },
    { slice: ReservationStatus.PENDING, status: ReservationStatus.PENDING },
    { slice: ReservationStatus.FULFILLED, status: ReservationStatus.FULFILLED },
    { slice: ReservationStatus.CANCELLED, status: ReservationStatus.CANCELLED },
    { slice: ReservationStatus.EXPIRED, status: ReservationStatus.EXPIRED },
  ]

  const results = useQueries({
    queries: slices.map(({ slice, status }) => ({
      queryKey: reservationKeys.stats(slice),
      queryFn: () =>
        reservationApi.getReservations({
          page: 1,
          limit: 1,
          ...(status ? { status } : {}),
        }),
    })),
  })

  const loading = results.some((r) => r.isPending)
  const all = results[0]?.data?.meta.totalItems ?? 0
  const pending = results[1]?.data?.meta.totalItems ?? 0
  const fulfilled = results[2]?.data?.meta.totalItems ?? 0
  const cancelled = results[3]?.data?.meta.totalItems ?? 0
  const expired = results[4]?.data?.meta.totalItems ?? 0

  return {
    counts: {
      all,
      pending,
      fulfilled,
      closed: cancelled + expired,
    },
    loading,
  }
}

export const useReservations = (params: GetReservationsParams) => {
  return useQuery({
    queryKey: reservationKeys.list(params),
    queryFn: () => reservationApi.getReservations(params),
  })
}

export const useReservation = (id: string) => {
  return useQuery({
    queryKey: reservationKeys.detail(id),
    queryFn: () => reservationApi.getReservationById(id),
    enabled: !!id,
  })
}

export const useCreateReservation = () => {
  const queryClient = useQueryClient()

  return useMutation<Reservation, Error, CreateReservationRequest>({
    mutationFn: (data) => reservationApi.createReservation(data),
    onSuccess: () => {
      invalidateReservationLists(queryClient)
    },
  })
}

export const useUpdateReservation = () => {
  const queryClient = useQueryClient()

  type UpdateVariables = { id: string; data: UpdateReservationRequest }
  return useMutation<Reservation, Error, UpdateVariables>({
    mutationFn: ({ id, data }) => reservationApi.updateReservation(id, data),
    onSuccess: (_, variables) => {
      invalidateReservationLists(queryClient)
      queryClient.invalidateQueries({ queryKey: reservationKeys.detail(variables.id) })
    },
  })
}

export const useDeleteReservation = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => reservationApi.deleteReservation(id),
    onSuccess: () => {
      invalidateReservationLists(queryClient)
    },
  })
}
