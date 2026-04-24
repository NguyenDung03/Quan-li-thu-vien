import api from "@/lib/api";
import type {
  Publisher,
  PublishersResponse,
  GetPublishersParams,
} from "@/types/book.type";

export const publisherApi = {
  getPublishers: async (
    params?: GetPublishersParams,
  ): Promise<PublishersResponse> => {
    const response = await api.get<PublishersResponse>("/publishers", {
      params,
    });
    return response.data;
  },

  getPublisherById: async (id: string): Promise<Publisher> => {
    const response = await api.get<Publisher>(`/publishers/${id}`);
    return response.data;
  },
};
