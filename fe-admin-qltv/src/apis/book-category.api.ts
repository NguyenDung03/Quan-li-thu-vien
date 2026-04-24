import axiosClient from './axios-client'
import type {
  BookCategory,
  CreateBookCategoryRequest,
  UpdateBookCategoryRequest,
  GetBookCategoriesParams,
  BookCategoriesResponse,
} from '@/types/book-category.types'

export const bookCategoryApi = {
  getBookCategories: async (params: GetBookCategoriesParams): Promise<BookCategoriesResponse> => {
    const response = await axiosClient.get<BookCategoriesResponse>('/api/book-categories', { params })
    return response.data
  },

  getBookCategoryById: async (id: string): Promise<BookCategory> => {
    const response = await axiosClient.get<BookCategory>(`/api/book-categories/${id}`)
    return response.data
  },

  createBookCategory: async (data: CreateBookCategoryRequest): Promise<BookCategory> => {
    const response = await axiosClient.post<BookCategory>('/api/book-categories', data)
    return response.data
  },

  updateBookCategory: async (id: string, data: UpdateBookCategoryRequest): Promise<BookCategory> => {
    const response = await axiosClient.patch<BookCategory>(`/api/book-categories/${id}`, data)
    return response.data
  },

  deleteBookCategory: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/book-categories/${id}`)
  },
}
