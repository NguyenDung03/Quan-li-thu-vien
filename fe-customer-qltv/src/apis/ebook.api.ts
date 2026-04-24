import api from "@/lib/api";
import type {
  Ebook,
  EbooksResponse,
  GetEbooksParams,
} from "@/types/ebook.type";

export const ebookApi = {
  getEbooks: async (params?: GetEbooksParams): Promise<EbooksResponse> => {
    const response = await api.get<EbooksResponse>("/ebooks", { params });
    return response.data;
  },

  getEbookById: async (id: string): Promise<Ebook> => {
    const response = await api.get<Ebook>(`/ebooks/${id}`);
    return response.data;
  },

  getEbookByBookId: async (bookId: string): Promise<Ebook> => {
    const response = await api.get<Ebook>(`/ebooks/by-book/${bookId}`);
    return response.data;
  },

  incrementDownloadCount: async (id: string): Promise<Ebook> => {
    const response = await api.patch<Ebook>(`/ebooks/${id}/download`);
    return response.data;
  },
};
