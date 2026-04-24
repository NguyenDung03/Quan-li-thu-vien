import {
  useQuery,
  useMutation,
  useQueryClient,
  useQueries,
} from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import { borrowRecordApi } from '@/apis/borrow-record.api'
import type {
  BorrowRecord,
  GetBorrowRecordsParams,
  CreateBorrowRecordRequest,
  UpdateBorrowRecordRequest,
  RenewBorrowOfflineRequest,
  BorrowRecordStatusType,
} from '@/types/borrow-record.types'

export type BorrowRecordStatsSlice = 'all' | BorrowRecordStatusType

export const borrowRecordKeys = {
  all: ['borrow-records'] as const,
  lists: () => [...borrowRecordKeys.all, 'list'] as const,
  list: (params: GetBorrowRecordsParams) => [...borrowRecordKeys.lists(), params] as const,
  details: () => [...borrowRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...borrowRecordKeys.details(), id] as const,
  stats: (slice: BorrowRecordStatsSlice) => [...borrowRecordKeys.all, 'stats', slice] as const,
}

function invalidateBorrowRecordLists(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: borrowRecordKeys.lists() })
  queryClient.invalidateQueries({ queryKey: [...borrowRecordKeys.all, 'stats'] })
}

export function useBorrowRecordStats() {
  const slices: {
    slice: BorrowRecordStatsSlice
    status?: BorrowRecordStatusType
  }[] = [
    { slice: 'all' },
    { slice: 'borrowed', status: 'borrowed' },
    { slice: 'overdue', status: 'overdue' },
    { slice: 'returned', status: 'returned' },
  ]

  const results = useQueries({
    queries: slices.map(({ slice, status }) => ({
      queryKey: borrowRecordKeys.stats(slice),
      queryFn: () =>
        borrowRecordApi.getBorrowRecords({
          page: 1,
          limit: 1,
          ...(status ? { status } : {}),
        }),
    })),
  })

  const loading = results.some((r) => r.isPending)
  const counts = {
    all: results[0]?.data?.meta.totalItems ?? 0,
    borrowed: results[1]?.data?.meta.totalItems ?? 0,
    overdue: results[2]?.data?.meta.totalItems ?? 0,
    returned: results[3]?.data?.meta.totalItems ?? 0,
  }

  return { counts, loading }
}


export const useBorrowRecords = (params: GetBorrowRecordsParams) => {
  return useQuery({
    queryKey: borrowRecordKeys.list(params),
    queryFn: () => borrowRecordApi.getBorrowRecords(params),
  })
}

export const useBorrowRecord = (id: string) => {
  return useQuery({
    queryKey: borrowRecordKeys.detail(id),
    queryFn: () => borrowRecordApi.getBorrowRecordById(id),
    enabled: !!id,
  })
}

export const useCreateBorrowRecord = () => {
  const queryClient = useQueryClient()

  return useMutation<BorrowRecord, Error, CreateBorrowRecordRequest>({
    mutationFn: (data) => borrowRecordApi.createBorrowRecord(data),
    onSuccess: () => {
      invalidateBorrowRecordLists(queryClient)
    },
  })
}

export const useUpdateBorrowRecord = () => {
  const queryClient = useQueryClient()

  type UpdateVariables = { id: string; data: UpdateBorrowRecordRequest }
  return useMutation<BorrowRecord, Error, UpdateVariables>({
    mutationFn: ({ id, data }) => borrowRecordApi.updateBorrowRecord(id, data),
    onSuccess: (_, variables) => {
      invalidateBorrowRecordLists(queryClient)
      queryClient.invalidateQueries({ queryKey: borrowRecordKeys.detail(variables.id) })
    },
  })
}

export const useDeleteBorrowRecord = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => borrowRecordApi.deleteBorrowRecord(id),
    onSuccess: () => {
      invalidateBorrowRecordLists(queryClient)
    },
  })
}

export const useReturnBook = () => {
  const queryClient = useQueryClient()

  type ReturnVariables = { id: string; librarianId: string; receivedCondition?: string; conditionDetails?: string }
  return useMutation<BorrowRecord, Error, ReturnVariables>({
    mutationFn: ({ id, ...body }) => borrowRecordApi.returnBook(id, body),
    onSuccess: () => {
      invalidateBorrowRecordLists(queryClient)
    },
  })
}

export const useMarkBookAsLost = () => {
  const queryClient = useQueryClient()

  return useMutation<BorrowRecord, Error, { id: string; librarianId: string }>({
    mutationFn: ({ id, librarianId }) =>
      borrowRecordApi.markBookAsLost(id, { librarianId }),
    onSuccess: () => {
      invalidateBorrowRecordLists(queryClient)
      queryClient.invalidateQueries({ queryKey: ['fines'] })
    },
  })
}

export const useRenewBorrowOffline = () => {
  const queryClient = useQueryClient()

  type Vars = { id: string; body?: RenewBorrowOfflineRequest }
  return useMutation<BorrowRecord, Error, Vars>({
    mutationFn: ({ id, body }) => borrowRecordApi.renewBorrowOffline(id, body),
    onSuccess: (_, variables) => {
      invalidateBorrowRecordLists(queryClient)
      queryClient.invalidateQueries({
        queryKey: borrowRecordKeys.detail(variables.id),
      })
    },
  })
}