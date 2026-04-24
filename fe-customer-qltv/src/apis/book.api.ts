import api from "@/lib/api";
import type { Book, BooksResponse, GetBooksParams } from "@/types/book.type";

export const bookApi = {
  getBooks: async (params?: GetBooksParams): Promise<BooksResponse> => {
    const response = await api.get<BooksResponse>("/books", { params });
    return response.data;
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await api.get<Book>(`/books/${id}`);
    return response.data;
  },
};
