import axiosClient from './axios-client'
import type {
  ReaderType,
  CreateReaderTypeRequest,
  UpdateReaderTypeRequest,
  GetReaderTypesParams,
  ReaderTypesResponse,
} from '@/types/reader-type.types'

export const readerTypeApi = {
  getReaderTypes: async (params: GetReaderTypesParams): Promise<ReaderTypesResponse> => {
    const response = await axiosClient.get<ReaderTypesResponse>('/api/reader-types', { params })
    return response.data
  },

  getReaderTypeById: async (id: string): Promise<ReaderType> => {
    const response = await axiosClient.get<ReaderType>(`/api/reader-types/${id}`)
    return response.data
  },

  createReaderType: async (data: CreateReaderTypeRequest): Promise<ReaderType> => {
    const response = await axiosClient.post<ReaderType>('/api/reader-types', data)
    return response.data
  },

  updateReaderType: async (id: string, data: UpdateReaderTypeRequest): Promise<ReaderType> => {
    const response = await axiosClient.patch<ReaderType>(`/api/reader-types/${id}`, data)
    return response.data
  },

  deleteReaderType: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/reader-types/${id}`)
  },
}
