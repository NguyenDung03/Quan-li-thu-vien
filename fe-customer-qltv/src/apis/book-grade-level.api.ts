import api from "@/lib/api";
import type {
  BookGradeLevel,
  BookGradeLevelsResponse,
  GetBookGradeLevelsParams,
} from "@/types/book.type";

export const bookGradeLevelApi = {
  getBookGradeLevels: async (
    params?: GetBookGradeLevelsParams,
  ): Promise<BookGradeLevelsResponse> => {
    const response = await api.get<BookGradeLevelsResponse>("/book-grade-levels", {
      params,
    });
    return response.data;
  },

  getBookGradeLevelById: async (
    bookId: string,
    gradeLevelId: string,
  ): Promise<BookGradeLevel> => {
    const response = await api.get<BookGradeLevel>(
      `/book-grade-levels/${bookId}/${gradeLevelId}`,
    );
    return response.data;
  },
};