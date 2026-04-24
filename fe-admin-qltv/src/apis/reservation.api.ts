import axiosClient from './axios-client'
import type {
  Reservation,
  CreateReservationRequest,
  UpdateReservationRequest,
  GetReservationsParams,
  ReservationsResponse,
} from '@/types/reservation.types'

export const reservationApi = {
  getReservations: async (
    params: GetReservationsParams
  ): Promise<ReservationsResponse> => {
    const response = await axiosClient.get<ReservationsResponse>('/api/reservations/admin', {
      params,
    })
    return response.data
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await axiosClient.get<Reservation>(`/api/reservations/${id}`)
    return response.data
  },

  createReservation: async (data: CreateReservationRequest): Promise<Reservation> => {
    const response = await axiosClient.post<Reservation>('/api/reservations', data)
    return response.data
  },

  updateReservation: async (
    id: string,
    data: UpdateReservationRequest
  ): Promise<Reservation> => {
    const response = await axiosClient.patch<Reservation>(`/api/reservations/${id}`, data)
    return response.data
  },

  deleteReservation: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/reservations/${id}`)
  },

  
  mintAdminSseTicket: async (): Promise<{ ticket: string }> => {
    const response = await axiosClient.post<{ ticket: string }>(
      '/api/reservations/notifications/admin/sse-ticket'
    )
    return response.data
  },
}
