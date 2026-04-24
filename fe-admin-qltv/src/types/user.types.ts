import type { PaginatedResponse } from './common.types'

export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'reader'
  accountStatus: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
  updatedAt: string
  fullName?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  phone?: string
  readerTypeId?: string
  cardNumber?: string
  cardIssueDate?: string
  cardExpiryDate?: string | null
}

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  role?: 'admin' | 'reader'
  accountStatus?: 'active' | 'inactive'
  fullName?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  phone?: string
  readerTypeId?: string
  readerId?: string
  cardNumber?: string
  cardIssueDate?: string
  cardExpiryDate?: string | null
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  password?: string
  role?: 'admin' | 'reader'
  accountStatus?: 'active' | 'inactive'
  fullName?: string
  dob?: string
  gender?: 'male' | 'female' | 'other'
  address?: string
  phone?: string
  readerTypeId?: string
}

export interface GetUsersParams {
  page?: number
  limit?: number
  type?: 'admin' | 'reader'
  is_active?: boolean
  search?: string
}

export type UsersResponse = PaginatedResponse<User>


export interface ReaderInfo {
  id: string
  fullName: string
  cardNumber: string
  readerType: string
  phone: string
  address: string
  dob: string
  gender: 'male' | 'female' | 'other'
  cardIssueDate: string
  cardExpiryDate: string | null
  isActive: boolean
}

export interface UserWithReader {
  id: string
  username: string
  email: string
  role: 'admin' | 'reader'
  accountStatus: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
  updatedAt: string
  reader?: ReaderInfo
}


export interface ImportResult {
  successCount: number
  skippedCount: number
  skippedRecords: {
    email: string
    reason: string
  }[]
  totalCount: number
}
