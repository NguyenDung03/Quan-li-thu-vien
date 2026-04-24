import api from "@/lib/api";
import type {
  Author,
  AuthorsResponse,
  GetAuthorsParams,
} from "@/types/book.type";

export const authorApi = {
  getAuthors: async (params?: GetAuthorsParams): Promise<AuthorsResponse> => {
    const response = await api.get<AuthorsResponse>("/authors", { params });
    return response.data;
  },

  getAuthorById: async (id: string): Promise<Author> => {
    const response = await api.get<Author>(`/authors/${id}`);
    return response.data;
  },
};
