import api from "@/lib/api";
import type {
  ReadingHistory,
  ReadingHistoriesResponse,
  GetReadingHistoriesParams,
} from "@/types/reading-history.type";

export const readingHistoryApi = {
  getReadingHistories: async (
    params?: GetReadingHistoriesParams,
  ): Promise<ReadingHistoriesResponse> => {
    const response = await api.get<ReadingHistoriesResponse>(
      "/reading-histories",
      { params },
    );
    return response.data;
  },

  getReadingHistoryById: async (id: string): Promise<ReadingHistory> => {
    const response = await api.get<ReadingHistory>(`/reading-histories/${id}`);
    return response.data;
  },
};
