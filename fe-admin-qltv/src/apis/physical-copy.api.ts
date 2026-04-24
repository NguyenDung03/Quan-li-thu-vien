import axiosClient from './axios-client'
import type {
  PhysicalCopy,
  CreatePhysicalCopyRequest,
  UpdatePhysicalCopyRequest,
  GetPhysicalCopiesParams,
  PhysicalCopiesResponse,
} from '@/types/physical-copy.types'

export const physicalCopyApi = {
  getPhysicalCopies: async (
    params: GetPhysicalCopiesParams,
  ): Promise<PhysicalCopiesResponse> => {
    const response = await axiosClient.get<PhysicalCopiesResponse>(
      '/api/physical-copies',
      { params },
    )
    return response.data
  },

  getPhysicalCopyById: async (id: string): Promise<PhysicalCopy> => {
    const response = await axiosClient.get<PhysicalCopy>(
      `/api/physical-copies/${id}`,
    )
    return response.data
  },

  createPhysicalCopy: async (
    data: CreatePhysicalCopyRequest,
  ): Promise<PhysicalCopy> => {
    const response = await axiosClient.post<PhysicalCopy>(
      '/api/physical-copies',
      data,
    )
    return response.data
  },

  updatePhysicalCopy: async (
    id: string,
    data: UpdatePhysicalCopyRequest,
  ): Promise<PhysicalCopy> => {
    const response = await axiosClient.patch<PhysicalCopy>(
      `/api/physical-copies/${id}`,
      data,
    )
    return response.data
  },

  deletePhysicalCopy: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/physical-copies/${id}`)
  },
}