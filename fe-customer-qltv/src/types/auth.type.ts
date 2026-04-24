
export interface User {
  id: string
  username: string
  email: string
  role: "admin" | "reader"
  accountStatus: "active" | "inactive"
  lastLogin: string
  createdAt?: string
  updatedAt?: string
  fullName?: string
  dob?: string
  gender?: "male" | "female" | "other"
  address?: string
  phone?: string
  avatar?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  newPassword: string
}

export interface ChangePasswordRequest {
  oldPassword: string
  newPassword: string
}

export interface RegisterRequest {
  username: string
  password: string
  email: string
  fullName?: string
}

export interface UpdateUserRequest {
  fullName?: string
  dob?: string
  gender?: "male" | "female" | "other"
  address?: string
  phone?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}