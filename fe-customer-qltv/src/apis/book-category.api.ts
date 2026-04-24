import api from "@/lib/api";
import type { BookCategory, BookCategoriesResponse } from "@/types/book.type";

const CATEGORY_PAGE_SIZE = 50;

export const bookCategoryApi = {
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<BookCategoriesResponse> => {
    const response = await api.get<BookCategoriesResponse>("/book-categories", {
      params,
    });
    return response.data;
  },

  
  getAllCategories: async (): Promise<BookCategoriesResponse> => {
    const merged: BookCategory[] = [];
    let page = 1;
    let hasNext = true;
    while (hasNext) {
      const res = await api.get<BookCategoriesResponse>("/book-categories", {
        params: { page, limit: CATEGORY_PAGE_SIZE },
      });
      const body = res.data;
      merged.push(...body.data);
      hasNext = Boolean(body.meta?.hasNextPage);
      page += 1;
    }
    const total = merged.length;
    return {
      data: merged,
      meta: {
        page: 1,
        limit: Math.max(total, 1),
        totalItems: total,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  },

  getCategoryById: async (id: string): Promise<BookCategory> => {
    const response = await api.get<BookCategory>(`/book-categories/${id}`);
    return response.data;
  },
};
