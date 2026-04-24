import type { PaginatedResponse } from './common.types'

export type FineStatus = 'unpaid' | 'paid'

export interface Fine {
  id: string
  created_at: string
  updated_at: string
  borrowId: string
  fineAmount: number
  fineDate: string
  reason: string
  status: FineStatus
  paymentDate?: string
  borrow?: {
    id: string
    reader?: {
      id: string
      fullName: string
      cardNumber: string
    }
    copy?: {
      id: string
      barcode: string
      status: string
      currentCondition: string
      conditionDetails?: string
      purchaseDate?: string
      price?: number
      purchasePrice?: number
      book?: {
        id: string
        title: string
        isbn?: string
      }
      location?: {
        id: string
        name: string
        floor?: string
        section?: string
        shelf?: string
      }
    }
  }
  reader?: {
    id: string
    fullName: string
    cardNumber: string
  }
}

export interface CreateFineRequest {
  borrowId: string
  fineAmount: number
  fineDate: string
  reason: string
  status: FineStatus
  paymentDate?: string
}

export interface UpdateFineRequest {
  borrowId?: string
  fineAmount?: number
  fineDate?: string
  reason?: string
  status?: FineStatus
  paymentDate?: string
}

export interface GetFinesParams {
  page?: number
  limit?: number
  search?: string
}

export type FinesResponse = PaginatedResponse<Fine>


export interface FineRulesResponse {
  overdueFeePerDay: number
  damagedBookFineMode: 'fixed' | 'percent'
  damagedBookFineFixed: number
  damagedBookFinePercent: number
  
  lostBookFineMode: 'percent' | 'fixed'
  lostBookReimbursePercent: number
  lostBookProcessingFee: number
  lostBookOverdueDaysAsLost: number
  
  renewalFeeAmount?: number
}

export interface UpdateFineRulesRequest {
  overdueFeePerDay: number
  damagedBookFineMode: 'fixed' | 'percent'
  damagedBookFineFixed: number
  damagedBookFinePercent: number
  lostBookFineMode: 'percent' | 'fixed'
  lostBookProcessingFee: number
  lostBookReimbursePercent: number
  lostBookOverdueDaysAsLost: number
}