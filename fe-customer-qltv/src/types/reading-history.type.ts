import type { PaginatedResponse } from "./common.type"

export interface ReadingHistory {
  id?: string
  readerId: string
  bookId: string
  bookTitle?: string
  startDate: string
  endDate?: string | null
  progressPercentage: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateReadingHistoryRequest {
  bookId: string
  startDate?: string
  progressPercentage: number
}

export interface UpdateReadingHistoryRequest {
  endDate?: string
  progressPercentage: number
}

export interface GetReadingHistoriesParams {
  page?: number
  limit?: number
  search?: string
  readerId?: string
}

export type ReadingHistoriesResponse = PaginatedResponse<ReadingHistory>