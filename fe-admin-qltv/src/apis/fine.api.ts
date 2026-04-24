import axiosClient from './axios-client'
import type {
  Fine,
  CreateFineRequest,
  UpdateFineRequest,
  GetFinesParams,
  FinesResponse,
  FineRulesResponse,
  UpdateFineRulesRequest,
} from '@/types/fine.types'

export const fineApi = {
  getFines: async (params: GetFinesParams): Promise<FinesResponse> => {
    const response = await axiosClient.get<FinesResponse>('/api/fines', { params })
    return response.data
  },

  getFineById: async (id: string): Promise<Fine> => {
    const response = await axiosClient.get<Fine>(`/api/fines/${id}`)
    return response.data
  },

  createFine: async (data: CreateFineRequest): Promise<Fine> => {
    const response = await axiosClient.post<Fine>('/api/fines', data)
    return response.data
  },

  updateFine: async (id: string, data: UpdateFineRequest): Promise<Fine> => {
    const response = await axiosClient.patch<Fine>(`/api/fines/${id}`, data)
    return response.data
  },

  deleteFine: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/fines/${id}`)
  },

  getFineRules: async (): Promise<FineRulesResponse> => {
    const response = await axiosClient.get<FineRulesResponse>('/api/fines/rules')
    return response.data
  },

  updateFineRules: async (
    data: UpdateFineRulesRequest,
  ): Promise<FineRulesResponse> => {
    const response = await axiosClient.patch<FineRulesResponse>(
      '/api/fines/rules',
      data,
    )
    return response.data
  },
}