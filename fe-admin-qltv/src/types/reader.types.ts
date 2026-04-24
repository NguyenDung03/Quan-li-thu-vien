import type { PaginatedResponse } from './common.types'
import type { ReaderType } from './reader-type.types'

export const ReaderTypeEnum = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  STAFF: 'staff',
} as const

export type ReaderTypeEnum = (typeof ReaderTypeEnum)[keyof typeof ReaderTypeEnum]

export const READER_TYPE_PREFIX = {
  student: 'STU',
  teacher: 'TEA',
  staff: 'STA',
} as const

export interface Reader {
  id: string
  userId: string
  readerTypeId: string
  readerType?: ReaderType
  fullName: string
  dob: string
  gender: 'male' | 'female' | 'other'
  address: string
  phone: string
  cardNumber: string
  cardIssueDate: string
  cardExpiryDate: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateReaderRequest {
  userId: string
  readerTypeId: string
  fullName: string
  dob: string
  gender: 'male' | 'female' | 'other'
  address: string
  phone: string
  cardNumber: string
  cardIssueDate: string
  cardExpiryDate: string | null
  isActive: boolean
}

export interface UpdateReaderRequest extends Partial<CreateReaderRequest> {}

export interface GetReadersParams {
  page?: number
  limit?: number
  search?: string
}

export type ReadersResponse = PaginatedResponse<Reader>
