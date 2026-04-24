import axiosClient from './axios-client'
import type {
  Book,
  CreateBookRequest,
  UpdateBookRequest,
  GetBooksParams,
  BooksResponse,
  BookAuthor,
} from '@/types/book.types'

export const bookApi = {
  getBooks: async (params: GetBooksParams): Promise<BooksResponse> => {
    const response = await axiosClient.get<BooksResponse>('/api/books', { params })
    return response.data
  },

  getBookById: async (id: string): Promise<Book> => {
    const response = await axiosClient.get<Book>(`/api/books/${id}`)
    return response.data
  },

  createBook: async (data: CreateBookRequest): Promise<Book> => {
    const response = await axiosClient.post<Book>('/api/books', data)
    return response.data
  },

  updateBook: async (id: string, data: UpdateBookRequest): Promise<Book> => {
    const response = await axiosClient.patch<Book>(`/api/books/${id}`, data)
    return response.data
  },

  deleteBook: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/books/${id}`)
  },

  addBookAuthor: async (data: { bookId: string; authorId: string }): Promise<BookAuthor> => {
    const response = await axiosClient.post<BookAuthor>('/api/book-authors', data)
    return response.data
  },

  removeBookAuthor: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/book-authors/${id}`)
  },

  addBookGradeLevel: async (bookId: string, gradeLevelId: string): Promise<void> => {
    await axiosClient.post(`/api/book-grade-levels/${bookId}/${gradeLevelId}`)
  },

  removeBookGradeLevel: async (bookId: string, gradeLevelId: string): Promise<void> => {
    await axiosClient.delete(`/api/book-grade-levels/${bookId}/${gradeLevelId}`)
  },
}