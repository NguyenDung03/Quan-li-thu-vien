import type { PaginatedResponse } from './common.types'

export interface GradeLevel {
  id: string
  name: string
  description?: string
  orderNo: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateGradeLevelRequest {
  name: string
  description?: string
  orderNo: number
}

export interface UpdateGradeLevelRequest {
  name: string
  description?: string
  orderNo: number
}

export interface GetGradeLevelsParams {
  page?: number
  limit?: number
  search?: string
}

export type GradeLevelsResponse = PaginatedResponse<GradeLevel>
