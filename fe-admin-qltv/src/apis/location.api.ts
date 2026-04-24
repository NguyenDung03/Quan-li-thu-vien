import axiosClient from './axios-client'
import type {
  Location,
  CreateLocationRequest,
  UpdateLocationRequest,
  GetLocationsParams,
  LocationsResponse,
} from '@/types/location.types'

export const locationApi = {
  getLocations: async (params: GetLocationsParams): Promise<LocationsResponse> => {
    const response = await axiosClient.get<LocationsResponse>('/api/locations', { params })
    return response.data
  },

  getLocationById: async (id: string): Promise<Location> => {
    const response = await axiosClient.get<Location>(`/api/locations/${id}`)
    return response.data
  },

  createLocation: async (data: CreateLocationRequest): Promise<Location> => {
    const response = await axiosClient.post<Location>('/api/locations', data)
    return response.data
  },

  updateLocation: async (id: string, data: UpdateLocationRequest): Promise<Location> => {
    const response = await axiosClient.patch<Location>(`/api/locations/${id}`, data)
    return response.data
  },

  deleteLocation: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/locations/${id}`)
  },
}
