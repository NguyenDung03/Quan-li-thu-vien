import type { PaginatedResponse } from './common.types'
import type { BookAuthor, BookGradeLevel } from './book.types'

export interface GetBookAuthorsLinkParams {
  page?: number
  limit?: number
  search?: string
  bookId?: string
}

export type BookAuthorsLinkResponse = PaginatedResponse<BookAuthor>

export interface GetBookGradeLevelsLinkParams {
  page?: number
  limit?: number
  bookId?: string
}

export type BookGradeLevelsLinkResponse = PaginatedResponse<BookGradeLevel>
