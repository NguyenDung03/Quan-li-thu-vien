import type { PaginatedResponse } from './common.types'
import type { Author } from './author.types'
import type { Publisher } from './publisher.types'
import type { BookCategory } from './book-category.types'
import type { GradeLevel } from './grade-level.types'

export type BookType = 'ebook' | 'physical'
export type PhysicalType = 'library_use' | 'borrowable'

export interface BookCoverImageEntity {
  cloudinaryUrl?: string
}

export interface Book {
  id: string
  title: string
  isbn: string
  publishYear: number
  edition?: string
  description?: string
  coverImageId?: string
  coverImage?: string
  coverImageEntity?: BookCoverImageEntity
  language: string
  pageCount: number
  bookType: BookType
  physicalType?: PhysicalType
  publisherId: string
  mainCategoryId: string
  
  physicalCopiesQuantity?: number
  uploadId?: string
  defaultLocationCode?: string
  
  physicalCopyPrice?: number
  
  publisher?: Publisher
  mainCategory?: BookCategory
  bookAuthors?: BookAuthor[]
  bookGradeLevels?: BookGradeLevel[]
  createdAt?: string
  updatedAt?: string
}

export interface BookAuthor {
  id: string
  bookId: string
  authorId: string
  author?: Author
}

export interface BookGradeLevel {
  id: string
  bookId: string
  gradeLevelId: string
  gradeLevel?: GradeLevel
}

export interface CreateBookRequest {
  title: string
  isbn: string
  publishYear: number
  edition?: string
  description?: string
  coverImageId?: string
  coverImage?: string
  language: string
  pageCount: number
  bookType: BookType
  physicalType?: PhysicalType
  publisherId: string
  mainCategoryId: string
  authorIds?: string[]
  gradeLevelIds?: string[]
  
  physicalCopiesQuantity?: number
  uploadId?: string
  defaultLocationCode?: string
  
  physicalCopyPrice?: number
}

export type UpdateBookRequest = Partial<CreateBookRequest>

export interface GetBooksParams {
  page?: number
  limit?: number
  search?: string
}

export type BooksResponse = PaginatedResponse<Book>
