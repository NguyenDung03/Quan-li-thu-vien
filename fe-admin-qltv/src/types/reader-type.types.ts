import type { PaginatedResponse } from './common.types'

export interface ReaderType {
  id: string
  created_at: string
  updated_at: string
  typeName: string
  maxBorrowLimit: number
  borrowDurationDays: number
}

export interface CreateReaderTypeRequest {
  typeName: string
  maxBorrowLimit: number
  borrowDurationDays: number
}

export interface UpdateReaderTypeRequest {
  typeName: string
  maxBorrowLimit: number
  borrowDurationDays: number
}

export interface GetReaderTypesParams {
  page?: number
  limit?: number
  search?: string
}

export type ReaderTypesResponse = PaginatedResponse<ReaderType>
