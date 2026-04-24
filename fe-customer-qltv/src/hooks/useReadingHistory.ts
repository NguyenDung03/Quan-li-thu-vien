import { useQuery } from "@tanstack/react-query"
import { readingHistoryApi } from "@/apis/reading-history.api"
import type { GetReadingHistoriesParams } from "@/types/reading-history.type"

export const useReadingHistory = (params?: GetReadingHistoriesParams) => {
  const getReadingHistoriesQuery = useQuery({
    queryKey: ["reading-histories", params],
    queryFn: () => readingHistoryApi.getReadingHistories(params),
  })

  return {
    readingHistories: getReadingHistoriesQuery.data,
    readingHistoriesLoading: getReadingHistoriesQuery.isLoading,
    readingHistoriesError: getReadingHistoriesQuery.error,
    refetchReadingHistories: getReadingHistoriesQuery.refetch,
  }
}

export const useReadingHistoryById = (id: string) => {
  const getReadingHistoryByIdQuery = useQuery({
    queryKey: ["reading-histories", id],
    queryFn: () => readingHistoryApi.getReadingHistoryById(id),
    enabled: !!id,
  })

  return {
    readingHistory: getReadingHistoryByIdQuery.data,
    readingHistoryLoading: getReadingHistoryByIdQuery.isLoading,
    readingHistoryError: getReadingHistoryByIdQuery.error,
  }
}
