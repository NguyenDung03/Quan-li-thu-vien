import axiosClient from './axios-client'
import type { GetBookAuthorsLinkParams, BookAuthorsLinkResponse } from '@/types/book-link.types'

export const bookAuthorsLinkApi = {
  getBookAuthors: async (params: GetBookAuthorsLinkParams): Promise<BookAuthorsLinkResponse> => {
    const response = await axiosClient.get<BookAuthorsLinkResponse>('/api/book-authors', { params })
    return response.data
  },
}
