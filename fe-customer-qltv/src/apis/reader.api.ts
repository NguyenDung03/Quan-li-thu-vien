import api from "@/lib/api";
import type { Reader, UpdateReaderRequest } from "@/types/reader.type";

export const readerApi = {
  getReaderByUserId: async (userId: string): Promise<Reader> => {
    const response = await api.get<Reader>(`/readers/user/${userId}`);
    return response.data;
  },

  updateReader: async (
    id: string,
    data: UpdateReaderRequest,
  ): Promise<Reader> => {
    const response = await api.patch<Reader>(`/readers/${id}`, data);
    return response.data;
  },
};
