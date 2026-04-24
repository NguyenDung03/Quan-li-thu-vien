import axiosClient from './axios-client'
import type { GetBookGradeLevelsLinkParams, BookGradeLevelsLinkResponse } from '@/types/book-link.types'

export const bookGradeLevelsLinkApi = {
  getBookGradeLevels: async (
    params: GetBookGradeLevelsLinkParams,
  ): Promise<BookGradeLevelsLinkResponse> => {
    const response = await axiosClient.get<BookGradeLevelsLinkResponse>('/api/book-grade-levels', {
      params,
    })
    return response.data
  },
}
