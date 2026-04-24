import axiosClient from './axios-client'
import type {
  GradeLevel,
  CreateGradeLevelRequest,
  UpdateGradeLevelRequest,
  GetGradeLevelsParams,
  GradeLevelsResponse,
} from '@/types/grade-level.types'

export const gradeLevelApi = {
  getGradeLevels: async (params: GetGradeLevelsParams): Promise<GradeLevelsResponse> => {
    const response = await axiosClient.get<GradeLevelsResponse>('/api/grade-levels', { params })
    return response.data
  },

  getGradeLevelById: async (id: string): Promise<GradeLevel> => {
    const response = await axiosClient.get<GradeLevel>(`/api/grade-levels/${id}`)
    return response.data
  },

  createGradeLevel: async (data: CreateGradeLevelRequest): Promise<GradeLevel> => {
    const response = await axiosClient.post<GradeLevel>('/api/grade-levels', data)
    return response.data
  },

  updateGradeLevel: async (id: string, data: UpdateGradeLevelRequest): Promise<GradeLevel> => {
    const response = await axiosClient.patch<GradeLevel>(`/api/grade-levels/${id}`, data)
    return response.data
  },

  deleteGradeLevel: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/grade-levels/${id}`)
  },
}
