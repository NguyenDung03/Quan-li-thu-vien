import type { PaginatedResponse } from './common.types'

export type PhysicalCopyStatus =
  | 'available'
  | 'borrowed'
  | 'reserved'
  | 'damaged'
  | 'lost'
  | 'maintenance'

export type PhysicalCopyCondition = 'new' | 'good' | 'worn' | 'damaged'

export interface PhysicalCopy {
  id: string
  created_at: string
  updated_at: string
  bookId: string
  barcode: string
  status: PhysicalCopyStatus
  currentCondition: PhysicalCopyCondition
  conditionDetails?: string
  purchaseDate?: string
  price?: number
  purchasePrice?: number
  locationId?: string
  book?: {
    id: string
    title: string
    isbn?: string
    coverImage?: string
    coverImageEntity?: { cloudinaryUrl?: string }
  }
  location?: {
    id: string
    name: string
    floor?: string
    section?: string
    shelf?: string
  }
}

export interface CreatePhysicalCopyRequest {
  bookId: string
  barcode: string
  status: PhysicalCopyStatus
  currentCondition: PhysicalCopyCondition
  conditionDetails?: string
  purchaseDate?: string
  purchasePrice?: number
  price?: number
  locationId?: string
}

export interface UpdatePhysicalCopyRequest {
  bookId?: string
  barcode?: string
  status?: PhysicalCopyStatus
  currentCondition?: PhysicalCopyCondition
  conditionDetails?: string
  purchaseDate?: string
  purchasePrice?: number
  price?: number
  locationId?: string
}

export interface GetPhysicalCopiesParams {
  page?: number
  limit?: number
  search?: string
  bookId?: string
  status?: PhysicalCopyStatus
}

export type PhysicalCopiesResponse = PaginatedResponse<PhysicalCopy>