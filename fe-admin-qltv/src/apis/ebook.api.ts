import axiosClient from './axios-client'
import type {
  Ebook,
  CreateEbookRequest,
  UpdateEbookRequest,
  GetEbooksParams,
  EbooksResponse,
} from '@/types/ebook.types'

export const ebookApi = {
  getEbooks: async (params: GetEbooksParams): Promise<EbooksResponse> => {
    const response = await axiosClient.get<EbooksResponse>('/api/ebooks', { params })
    return response.data
  },

  getEbookById: async (id: string): Promise<Ebook> => {
    const response = await axiosClient.get<Ebook>(`/api/ebooks/${id}`)
    return response.data
  },

  createEbook: async (data: CreateEbookRequest): Promise<Ebook> => {
    const response = await axiosClient.post<Ebook>('/api/ebooks', data)
    return response.data
  },

  updateEbook: async (id: string, data: UpdateEbookRequest): Promise<Ebook> => {
    const response = await axiosClient.patch<Ebook>(`/api/ebooks/${id}`, data)
    return response.data
  },

  deleteEbook: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/ebooks/${id}`)
  },
}