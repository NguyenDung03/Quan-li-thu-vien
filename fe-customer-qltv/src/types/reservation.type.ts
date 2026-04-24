import type { PaginatedResponse } from "./common.type"

export interface Reservation {
  id?: string
  readerId: string
  bookId: string
  bookTitle?: string
  book?: {
    id?: string
    title?: string
    isbn?: string
    publishYear?: number
    edition?: string
    description?: string
    coverImage?: string
    language?: string
    pageCount?: number
    bookType?: "ebook" | "physical"
    physicalType?: "library_use" | "borrowable"
    publisher?: {
      id?: string
      publisherName?: string
    }
    mainCategory?: {
      id?: string
      name?: string
    }
  }
  copy?: {
    id?: string
    barcode?: string
    currentCondition?: string
    price?: number
    purchasePrice?: number
    location?: {
      id?: string
      name?: string
      section?: string
      shelf?: string
      floor?: number
    }
  }
  copyId?: string
  reservationDate: string
  expiryDate: string
  status: "pending" | "fulfilled" | "cancelled" | "expired"
  cancellationReason?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateReservationRequest {
  readerId: string
  bookId: string
}

export interface UpdateReservationRequest {
  status: "pending" | "fulfilled" | "cancelled" | "expired"
  cancellationReason?: string
}

export interface GetReservationsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  readerId?: string
}

export type ReservationsResponse = PaginatedResponse<Reservation>