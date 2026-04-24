import api from "@/lib/api";
import type {
  BookAuthor,
  BookAuthorsResponse,
  GetBookAuthorsParams,
} from "@/types/book.type";

export const bookAuthorApi = {
  getBookAuthors: async (
    params?: GetBookAuthorsParams,
  ): Promise<BookAuthorsResponse> => {
    const response = await api.get<BookAuthorsResponse>("/book-authors", {
      params,
    });
    return response.data;
  },

  getBookAuthorById: async (id: string): Promise<BookAuthor> => {
    const response = await api.get<BookAuthor>(`/book-authors/${id}`);
    return response.data;
  },
};