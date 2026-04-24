import type { PaginatedResponse } from './common.types'

export interface Publisher {
  id: string
  publisherName: string
  address?: string
  phone?: string
  email?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreatePublisherRequest {
  publisherName: string
  address?: string
  phone?: string
  email?: string
}

export interface UpdatePublisherRequest {
  publisherName: string
  address?: string
  phone?: string
  email?: string
}

export interface GetPublishersParams {
  page?: number
  limit?: number
  search?: string
}

export type PublishersResponse = PaginatedResponse<Publisher>
