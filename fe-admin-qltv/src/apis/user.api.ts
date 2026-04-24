import axiosClient from './axios-client'
import type {
  User,
  UserWithReader,
  CreateUserRequest,
  UpdateUserRequest,
  GetUsersParams,
  UsersResponse,
  ImportResult,
} from '@/types/user.types'

export const userApi = {
  getUsers: async (params: GetUsersParams): Promise<UsersResponse> => {
    const response = await axiosClient.get<UsersResponse>('/api/users', { params })
    return response.data
  },

  getUserById: async (id: string): Promise<User> => {
    const response = await axiosClient.get<User>(`/api/users/${id}`)
    return response.data
  },

  getUserByIdWithReader: async (id: string): Promise<UserWithReader> => {
    const response = await axiosClient.get<UserWithReader>(`/api/users/${id}/with-reader`)
    return response.data
  },

  createUser: async (data: CreateUserRequest): Promise<User> => {
    const response = await axiosClient.post<User>('/api/users', data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await axiosClient.patch<User>(`/api/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/users/${id}`)
  },

  importUsers: async (file: File): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.post<ImportResult>('/api/users/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },
}
