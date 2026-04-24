import type { PaginatedResponse } from './common.types'


export const ReservationStatus = {
  PENDING: 'pending',
  FULFILLED: 'fulfilled',
  CANCELLED: 'cancelled',
  EXPIRED: 'expired',
} as const

export type ReservationStatusType =
  (typeof ReservationStatus)[keyof typeof ReservationStatus]


export interface Reservation {
  id: string
  readerId: string
  bookId: string
  copyId?: string
  reservationDate: string
  expiryDate: string
  status: ReservationStatusType
  cancellationReason: string | null
  reader?: {
    id: string
    fullName?: string
    cardNumber: string
    phone?: string
    address?: string
    user?: {
      fullName: string
    }
  }
  book?: {
    id: string
    title: string
    isbn?: string
  }
  createdAt?: string
  updatedAt?: string
}


export interface CreateReservationRequest {
  readerId: string
  bookId: string
}


export interface UpdateReservationRequest extends Partial<CreateReservationRequest> {
  status?: ReservationStatusType
  cancellationReason?: string
}


export interface GetReservationsParams {
  page?: number
  limit?: number
  search?: string
  status?: ReservationStatusType
  readerId?: string
}


export type ReservationsResponse = PaginatedResponse<Reservation>
