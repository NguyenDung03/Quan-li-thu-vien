import axiosClient from './axios-client'
import type {
  BorrowRecord,
  CreateBorrowRecordRequest,
  UpdateBorrowRecordRequest,
  GetBorrowRecordsParams,
  BorrowRecordsResponse,
  ReturnBookRequest,
  MarkLostBookRequest,
  RenewBorrowOfflineRequest,
} from '@/types/borrow-record.types'

export const borrowRecordApi = {
  getBorrowRecords: async (
    params: GetBorrowRecordsParams
  ): Promise<BorrowRecordsResponse> => {
    const response = await axiosClient.get<BorrowRecordsResponse>('/api/borrow-records', {
      params,
    })
    return response.data
  },

  getBorrowRecordById: async (id: string): Promise<BorrowRecord> => {
    const response = await axiosClient.get<BorrowRecord>(`/api/borrow-records/${id}`)
    return response.data
  },

  createBorrowRecord: async (data: CreateBorrowRecordRequest): Promise<BorrowRecord> => {
    const response = await axiosClient.post<BorrowRecord>('/api/borrow-records', data)
    return response.data
  },

  updateBorrowRecord: async (
    id: string,
    data: UpdateBorrowRecordRequest
  ): Promise<BorrowRecord> => {
    const response = await axiosClient.patch<BorrowRecord>(`/api/borrow-records/${id}`, data)
    return response.data
  },

  deleteBorrowRecord: async (id: string): Promise<void> => {
    await axiosClient.delete(`/api/borrow-records/${id}`)
  },

  returnBook: async (id: string, body: ReturnBookRequest): Promise<BorrowRecord> => {
    const response = await axiosClient.post<BorrowRecord>(
      `/api/borrow-records/${id}/return`,
      body,
    )
    return response.data
  },

  markBookAsLost: async (id: string, body: MarkLostBookRequest): Promise<BorrowRecord> => {
    const response = await axiosClient.post<BorrowRecord>(
      `/api/borrow-records/${id}/mark-lost`,
      body,
    )
    return response.data
  },

  renewBorrowOffline: async (
    id: string,
    body?: RenewBorrowOfflineRequest,
  ): Promise<BorrowRecord> => {
    const response = await axiosClient.post<BorrowRecord>(
      `/api/borrow-records/${id}/renew/offline`,
      body ?? {},
    )
    return response.data
  },
}