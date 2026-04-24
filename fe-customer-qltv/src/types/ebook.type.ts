import type { PaginatedResponse } from "@/types/common.type";

export interface Ebook {
  id?: string;
  bookId: string;
  filePath: string;
  fileSize: number;
  fileFormat: string;
  downloadCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PhysicalCopy {
  id?: string;
  bookId: string;
  barcode: string;
  status:
    | "available"
    | "borrowed"
    | "reserved"
    | "damaged"
    | "lost"
    | "maintenance";
  currentCondition: "new" | "good" | "worn" | "damaged";
  conditionDetails?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  locationId?: string;
  locationName?: string;
  notes?: string;
  lastCheckupDate?: string;
  isArchived: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GetEbooksParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface GetPhysicalCopiesParams {
  page?: number;
  limit?: number;
  search?: string;
}

export type EbooksResponse = PaginatedResponse<Ebook>;
export type PhysicalCopiesResponse = PaginatedResponse<PhysicalCopy>;
