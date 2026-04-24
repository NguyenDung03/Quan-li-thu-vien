import api from "@/lib/api";
import type {
  Reservation,
  ReservationsResponse,
  GetReservationsParams,
  CreateReservationRequest,
} from "@/types/reservation.type";

export const reservationApi = {
  getReservations: async (
    params?: GetReservationsParams,
  ): Promise<ReservationsResponse> => {
    const response = await api.get<ReservationsResponse>("/reservations", {
      params,
    });
    return response.data;
  },

  getReservationById: async (id: string): Promise<Reservation> => {
    const response = await api.get<Reservation>(`/reservations/${id}`);
    return response.data;
  },

  createReservation: async (
    data: CreateReservationRequest,
  ): Promise<Reservation> => {
    const response = await api.post<Reservation>("/reservations", data);
    return response.data;
  },
  cancelReservation: async (id: string): Promise<void> => {
    await api.delete(`/reservations/${id}`);
  },
};
