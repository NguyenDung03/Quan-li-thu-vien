import api from "@/lib/api";
import type {
  Location,
  LocationsResponse,
  GetLocationsParams,
} from "@/types/book.type";

export const locationApi = {
  getLocations: async (
    params?: GetLocationsParams,
  ): Promise<LocationsResponse> => {
    const response = await api.get<LocationsResponse>("/locations", {
      params,
    });
    return response.data;
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  },
};