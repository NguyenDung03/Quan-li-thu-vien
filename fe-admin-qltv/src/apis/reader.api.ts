import axiosClient from './axios-client'
import type {
  Reader,
  CreateReaderRequest,
  UpdateReaderRequest,
  GetReadersParams,
  ReadersResponse,
} from '@/types/reader.types'

export const readerApi = {
  getReaders: async (params: GetReadersParams): Promise<ReadersResponse> => {
    const response = await axiosClient.get<ReadersResponse>('/api/readers', { params })
    return response.data
  },

  getReaderById: async (id: string): Promise<Reader> => {
    const response = await axiosClient.get<Reader>(`/api/readers/${id}`)
    return response.data
  },

  getReaderByUserId: async (userId: string): Promise<Reader> => {
    const response = await axiosClient.get<Reader>(`/api/readers/user/${userId}`)
    return response.data
  },

  createReader: async (data: CreateReaderRequest): Promise<Reader> => {
    const response = await axiosClient.post<Reader>('/api/readers', data)
    return response.data
  },

  updateReader: async (id: string, data: UpdateReaderRequest): Promise<Reader> => {
    const response = await axiosClient.patch<Reader>(`/api/readers/${id}`, data)
    return response.data
  },

  deleteReader: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/readers/${id}`)
  },
}
