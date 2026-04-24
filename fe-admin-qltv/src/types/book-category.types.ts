import type { PaginatedResponse } from './common.types'

export interface BookCategory {
  id: string
  name: string
  parentId?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateBookCategoryRequest {
  name: string
  parentId?: string
}

export interface UpdateBookCategoryRequest {
  name: string
  parentId?: string
}

export interface GetBookCategoriesParams {
  page?: number
  limit?: number
  search?: string
}

export type BookCategoriesResponse = PaginatedResponse<BookCategory>
