import axiosClient from './axios-client'
import type {
  Author,
  CreateAuthorRequest,
  UpdateAuthorRequest,
  GetAuthorsParams,
  AuthorsResponse,
} from '@/types/author.types'

export const authorApi = {
  getAuthors: async (params: GetAuthorsParams): Promise<AuthorsResponse> => {
    const response = await axiosClient.get<AuthorsResponse>('/api/authors', { params })
    return response.data
  },

  getAuthorById: async (id: string): Promise<Author> => {
    const response = await axiosClient.get<Author>(`/api/authors/${id}`)
    return response.data
  },

  createAuthor: async (data: CreateAuthorRequest): Promise<Author> => {
    const response = await axiosClient.post<Author>('/api/authors', data)
    return response.data
  },

  updateAuthor: async (id: string, data: UpdateAuthorRequest): Promise<Author> => {
    const response = await axiosClient.patch<Author>(`/api/authors/${id}`, data)
    return response.data
  },

  deleteAuthor: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/authors/${id}`)
  },
}
