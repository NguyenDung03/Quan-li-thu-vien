import type { PaginatedResponse } from './common.types'

export interface Author {
  id: string
  authorName: string
  bio?: string
  nationality?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateAuthorRequest {
  authorName: string
  bio?: string
  nationality?: string
}

export interface UpdateAuthorRequest {
  authorName: string
  bio?: string
  nationality?: string
}

export interface GetAuthorsParams {
  page?: number
  limit?: number
  search?: string
}

export type AuthorsResponse = PaginatedResponse<Author>
