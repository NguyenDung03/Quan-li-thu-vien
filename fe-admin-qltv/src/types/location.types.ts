import type { PaginatedResponse } from './common.types'

export interface Location {
  id: string
  name: string
  slug: string
  description?: string
  floor?: number
  section?: string
  shelf?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateLocationRequest {
  name: string
  slug: string
  description?: string
  floor?: number
  section?: string
  shelf?: string
  isActive?: boolean
}

export interface UpdateLocationRequest {
  name?: string
  slug?: string
  description?: string
  floor?: number
  section?: string
  shelf?: string
  isActive?: boolean
}

export interface GetLocationsParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export type LocationsResponse = PaginatedResponse<Location>
