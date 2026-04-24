import type { PaginatedResponse } from "./common.type";

export interface Book {
  id?: string;
  title: string;
  isbn?: string;
  publishYear?: number;
  edition?: string;
  description?: string;
  coverImageId?: string;
  coverImage?: string;
  language?: string;
  pageCount?: number;
  bookType: "ebook" | "physical";
  physicalType?: "library_use" | "borrowable";
  publisherId?: string;
  publisherName?: string;
  mainCategoryId?: string;
  mainCategoryName?: string;
  
  mainCategory?: { id?: string; name?: string; parentId?: string | null };
  bookGradeLevels?: Array<{
    gradeLevelId?: string;
    gradeLevel?: { id?: string; name?: string };
  }>;
  authors?: Author[];
  availableCopies?: number;
  
  physicalCopiesTotalCount?: number;
  
  physicalCopiesAvailableCount?: number;
  createdAt?: string;
  updatedAt?: string;
}


export interface BookDisplay {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  categoryId?: string;
  
  gradeId?: string;
  grade?: string;
  
  gradeLevelIds?: string[];
  bookType: "ebook" | "physical";
  physicalType?: "library_use" | "borrowable";
  availableCopies?: number;
}

export interface Author {
  id?: string;
  authorName: string;
  bio?: string;
  nationality?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookCategory {
  id?: string;
  name: string;
  parentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Publisher {
  id?: string;
  publisherName: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GradeLevel {
  id?: string;
  name: string;
  description?: string;
  orderNo?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetBooksParams {
  page?: number;
  limit?: number;
  search?: string;
  bookType?: "ebook" | "physical";
  physicalType?: "library_use" | "borrowable";
  availablePhysical?: string;
}

export interface GetAuthorsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetPublishersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetGradeLevelsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type BooksResponse = PaginatedResponse<Book>;
export type AuthorsResponse = PaginatedResponse<Author>;
export type PublishersResponse = PaginatedResponse<Publisher>;
export type GradeLevelsResponse = PaginatedResponse<GradeLevel>;
export type BookCategoriesResponse = PaginatedResponse<BookCategory>;


export interface BookAuthor {
  bookId: string;
  authorId: string;
}

export interface GetBookAuthorsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type BookAuthorsResponse = PaginatedResponse<BookAuthor>;


export interface BookGradeLevel {
  bookId: string;
  gradeLevelId: string;
}

export interface GetBookGradeLevelsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type BookGradeLevelsResponse = PaginatedResponse<BookGradeLevel>;


export interface Location {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  floor?: number;
  section?: string;
  shelf?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetLocationsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type LocationsResponse = PaginatedResponse<Location>;
