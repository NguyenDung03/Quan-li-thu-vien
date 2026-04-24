import axiosClient from './axios-client'
import type {
  CrawlHealthResponse,
  CrawlJobResponse,
  CrawlRequestBody,
} from '@/types/crawl.types'

const CRAWL_TIMEOUT_MS = 300_000

export const crawlApi = {
  checkHealth: async (): Promise<CrawlHealthResponse> => {
    const response = await axiosClient.get<CrawlHealthResponse>('/api/crawl/health')
    return response.data
  },

  crawl: async (body: CrawlRequestBody): Promise<CrawlJobResponse> => {
    const response = await axiosClient.post<CrawlJobResponse>('/api/crawl', body, {
      timeout: CRAWL_TIMEOUT_MS,
    })
    return response.data
  },

  getTaskResult: async (taskId: string): Promise<Record<string, unknown>> => {
    const response = await axiosClient.get<Record<string, unknown>>(
      `/api/crawl/task/${encodeURIComponent(taskId)}`,
      { timeout: CRAWL_TIMEOUT_MS },
    )
    return response.data
  },
}
