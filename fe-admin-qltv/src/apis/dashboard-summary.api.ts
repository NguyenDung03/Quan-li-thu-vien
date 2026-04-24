import axiosClient from './axios-client'
import type { DashboardSummaryResponse } from '@/types/dashboard-summary.types'

export const dashboardSummaryApi = {
  getSummary: async (params?: { days?: number }): Promise<DashboardSummaryResponse> => {
    const response = await axiosClient.get<DashboardSummaryResponse>(
      '/api/admin/dashboard-summary',
      { params: { days: params?.days ?? 30 } },
    )
    return response.data
  },
}
