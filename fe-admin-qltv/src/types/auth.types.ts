
export const UserRole = {
  ADMIN: 'admin',
  READER: 'reader',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  accountStatus: 'active' | 'inactive'
  lastLogin: string
  createdAt: string
  updatedAt: string
}

export interface Reader {
  userId: string
  readerTypeId: string
  fullName: string
  dob: string
  gender: 'male' | 'female' | 'other'
  address: string
  phone: string
  cardNumber: string
  cardIssueDate: string
  cardExpiryDate: string
  isActive: boolean
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
}
