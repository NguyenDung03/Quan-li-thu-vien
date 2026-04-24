import type { PaginatedResponse } from './common.types'


export const BorrowRecordStatus = {
  BORROWED: 'borrowed',
  RETURNED: 'returned',
  OVERDUE: 'overdue',
  RENEWED: 'renewed',
  LOST: 'lost',
} as const

export type BorrowRecordStatusType =
  (typeof BorrowRecordStatus)[keyof typeof BorrowRecordStatus]


export interface BorrowRecord {
  id: string
  readerId: string
  copyId: string
  borrowDate: string
  dueDate: string
  returnDate: string | null
  status: BorrowRecordStatusType
  librarianId: string
  isRenewed: boolean
  
  conditionAtBorrow?: string | null
  reader?: {
    id: string
    fullName: string
    cardNumber: string
    phone?: string
    address?: string
    readerType?: {
      id: string
      typeName: string
      borrowDurationDays: number
    }
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
    notes?: string
    isArchived: boolean
    book?: {
      id: string
      title: string
      isbn?: string
      coverImage?: string | null
      coverImageEntity?: { cloudinaryUrl?: string | null }
    }
    location?: {
      id: string
      name: string
      floor?: string
      section?: string
      shelf?: string
    }
  }
  librarian?: {
    id: string
    username: string
  }
  book?: {
    id: string
    title: string
    coverImage?: string | null
    coverImageEntity?: { cloudinaryUrl?: string | null }
  }
  createdAt?: string
  updatedAt?: string
}


export interface CreateBorrowRecordRequest {
  readerId: string
  copyId: string
  borrowDate: string
  dueDate: string
  returnDate?: string | undefined
  status: string
  librarianId?: string
}


export type BorrowRecordFormSubmitPayload = CreateBorrowRecordRequest & {
  readerName?: string
  bookTitle?: string
  
  renewalOfflineFineAmount?: number
}


export interface UpdateBorrowRecordRequest extends Partial<CreateBorrowRecordRequest> {}


export interface GetBorrowRecordsParams {
  page?: number
  limit?: number
  search?: string
  status?: BorrowRecordStatusType
}


export type BorrowRecordsResponse = PaginatedResponse<BorrowRecord>


export interface ReturnBookRequest {
  librarianId: string
  receivedCondition?: string
  conditionDetails?: string
}

export interface MarkLostBookRequest {
  librarianId: string
}


export interface RenewBorrowOfflineRequest {
  fineAmount?: number
  collectedBy?: string
}