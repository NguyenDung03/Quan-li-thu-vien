import type { PaginatedResponse } from "./common.type"


export interface FineBorrowNested {
  id?: string
  borrowDate?: string
  dueDate?: string
  copy?: { book?: { title?: string } }
  book?: { title?: string }
}

export interface Fine {
  id?: string
  borrowId: string
  borrow?: FineBorrowNested
  borrowRecord?: {
    id: string
    bookTitle?: string
    borrowDate: string
    dueDate: string
  }
  fineAmount: number
  fineDate: string
  reason: string
  status: "unpaid" | "pending" | "paid" | "cancelled"
  paymentDate?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface GetFinesParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  readerId?: string
}

export type FinesResponse = PaginatedResponse<Fine>