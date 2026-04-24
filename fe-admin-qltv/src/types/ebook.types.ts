import type { PaginatedResponse } from './common.types'

export interface Ebook {
  id: string
  created_at: string
  updated_at: string
  bookId: string
  filePath: string
  fileSize: number
  fileFormat: string
  downloadCount: number
  book?: {
    id: string
    title: string
    isbn?: string
    coverImage?: string
    coverImageEntity?: { cloudinaryUrl?: string }
  }
}

export interface CreateEbookRequest {
  bookId: string
  filePath: string
  fileSize: number
  fileFormat: string
}

export interface UpdateEbookRequest {
  bookId?: string
  filePath?: string
  fileSize?: number
  fileFormat?: string
}

export interface GetEbooksParams {
  page?: number
  limit?: number
  search?: string
  bookId?: string
}

export type EbooksResponse = PaginatedResponse<Ebook>