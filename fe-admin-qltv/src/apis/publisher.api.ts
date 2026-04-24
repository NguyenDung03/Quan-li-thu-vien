import axiosClient from './axios-client'
import type {
  Publisher,
  CreatePublisherRequest,
  UpdatePublisherRequest,
  GetPublishersParams,
  PublishersResponse,
} from '@/types/publisher.types'

export const publisherApi = {
  getPublishers: async (params: GetPublishersParams): Promise<PublishersResponse> => {
    const response = await axiosClient.get<PublishersResponse>('/api/publishers', { params })
    return response.data
  },

  getPublisherById: async (id: string): Promise<Publisher> => {
    const response = await axiosClient.get<Publisher>(`/api/publishers/${id}`)
    return response.data
  },

  createPublisher: async (data: CreatePublisherRequest): Promise<Publisher> => {
    const response = await axiosClient.post<Publisher>('/api/publishers', data)
    return response.data
  },

  updatePublisher: async (id: string, data: UpdatePublisherRequest): Promise<Publisher> => {
    const response = await axiosClient.patch<Publisher>(`/api/publishers/${id}`, data)
    return response.data
  },

  deletePublisher: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/publishers/${id}`)
  },
}
