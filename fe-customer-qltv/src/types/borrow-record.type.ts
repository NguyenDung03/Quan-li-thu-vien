import type { PaginatedResponse } from "./common.type"


export interface BorrowRecordBook {
  id?: string
  title?: string
  isbn?: string
  publishYear?: number
  edition?: string
  description?: string
  coverImage?: string
  language?: string
  pageCount?: number
  bookType?: "ebook" | "physical"
  physicalType?: "library_use" | "borrowable"
  publisher?: { id?: string; publisherName?: string }
  mainCategory?: { id?: string; name?: string }
}


export interface BorrowRecordCopy {
  id?: string
  bookId?: string
  barcode?: string
  currentCondition?: string
  price?: number
  purchasePrice?: number
  book?: BorrowRecordBook
  location?: {
    id?: string
    name?: string
    section?: string
    shelf?: string
    floor?: number
  }
}

export interface BorrowRecord {
  id?: string
  readerId: string
  copyId: string
  bookId?: string
  bookTitle?: string
  book?: BorrowRecordBook
  copy?: BorrowRecordCopy
  reader?: { id?: string; fullName?: string; cardNumber?: string }
  librarian?: { id?: string; fullName?: string; username?: string }
  borrowDate: string
  dueDate: string
  returnDate?: string | null
  status: "borrowed" | "returned" | "overdue" | "renewed"
  librarianId?: string
  isRenewed?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface GetBorrowRecordsParams {
  page?: number
  limit?: number
  search?: string
  status?: string
  readerId?: string
}

export type BorrowRecordsResponse = PaginatedResponse<BorrowRecord>