import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationApi } from "@/apis/reservation.api";
import type {
  GetReservationsParams,
  CreateReservationRequest,
} from "@/types/reservation.type";

export const useReservation = (params?: GetReservationsParams) => {
  const getReservationsQuery = useQuery({
    queryKey: ["reservations", params],
    queryFn: () => reservationApi.getReservations(params),
  });

  return {
    reservations: getReservationsQuery.data,
    reservationsLoading: getReservationsQuery.isLoading,
    reservationsError: getReservationsQuery.error,
    refetchReservations: getReservationsQuery.refetch,
  };
};

export const useReservationById = (id: string) => {
  const getReservationByIdQuery = useQuery({
    queryKey: ["reservations", id],
    queryFn: () => reservationApi.getReservationById(id),
    enabled: !!id,
  });

  return {
    reservation: getReservationByIdQuery.data,
    reservationLoading: getReservationByIdQuery.isLoading,
    reservationError: getReservationByIdQuery.error,
  };
};

export const useCreateReservation = () => {
  const queryClient = useQueryClient();

  const createReservationMutation = useMutation({
    mutationFn: (data: CreateReservationRequest) =>
      reservationApi.createReservation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  return {
    createReservation: createReservationMutation.mutate,
    createReservationAsync: createReservationMutation.mutateAsync,
    isCreating: createReservationMutation.isPending,
    createError: createReservationMutation.error,
  };
};

export const useCancelReservation = () => {
  const queryClient = useQueryClient();

  const cancelReservationMutation = useMutation({
    mutationFn: (id: string) => reservationApi.cancelReservation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });

  return {
    cancelReservation: cancelReservationMutation.mutate,
    cancelReservationAsync: cancelReservationMutation.mutateAsync,
    isCanceling: cancelReservationMutation.isPending,
    cancelError: cancelReservationMutation.error,
  };
};
