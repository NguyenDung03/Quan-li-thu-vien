export interface CrawlHealthResponse {
  status: 'connected' | 'unhealthy' | 'unreachable'
  service: string
}

export interface CrawlJobResponse {
  status: string
  data: Record<string, unknown>
  time: number
}

export interface CrawlRequestBody {
  urls: string[]
  priority?: number
}
