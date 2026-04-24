import { useQuery } from "@tanstack/react-query";
import { locationApi } from "@/apis/location.api";
import type { GetLocationsParams } from "@/types/book.type";

export const useLocation = (params?: GetLocationsParams) => {
  const getLocationsQuery = useQuery({
    queryKey: ["locations", params],
    queryFn: () => locationApi.getLocations(params),
  });

  return {
    locations: getLocationsQuery.data,
    locationsLoading: getLocationsQuery.isLoading,
    locationsError: getLocationsQuery.error,
    refetchLocations: getLocationsQuery.refetch,
  };
};

export const useLocationById = (id: string) => {
  const getLocationByIdQuery = useQuery({
    queryKey: ["locations", id],
    queryFn: () => locationApi.getLocationById(id),
    enabled: !!id,
  });

  return {
    location: getLocationByIdQuery.data,
    locationLoading: getLocationByIdQuery.isLoading,
    locationError: getLocationByIdQuery.error,
  };
};