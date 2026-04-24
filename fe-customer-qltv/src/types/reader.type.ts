import type { PaginatedResponse } from "./common.type"

export interface Reader {
  id?: string
  userId: string
  readerTypeId?: string
  fullName: string
  dob: string
  gender: "male" | "female" | "other"
  address: string
  phone: string
  cardNumber: string
  cardIssueDate: string
  cardExpiryDate: string | null
  isActive: boolean
  readerType?: ReaderType
  createdAt?: string
  updatedAt?: string
}

export interface ReaderType {
  id?: string
  typeName: string
  maxBorrowLimit: number
  borrowDurationDays: number
  createdAt?: string
  updatedAt?: string
}

export interface GetReadersParams {
  page?: number
  limit?: number
  search?: string
}

export interface UpdateReaderRequest {
  readerTypeId?: string
  fullName?: string
  dob?: string
  gender?: "male" | "female" | "other"
  address?: string
  phone?: string
  cardNumber?: string
  cardIssueDate?: string
  cardExpiryDate?: string | null
  isActive?: boolean
}

export type ReadersResponse = PaginatedResponse<Reader>
export type ReaderTypesResponse = PaginatedResponse<ReaderType>