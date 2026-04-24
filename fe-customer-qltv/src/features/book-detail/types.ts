export interface BookDisplay {
  id: string;
  title: string;
  author: string;
  cover: string;
  grade: string;
  category: string;
  available: boolean;
  bookCode: string;
  description: string;
  publisher: string;
  year: number;
  pages: number;
  language: string;
  rating: number;
  borrowCount: number;
  difficulty: number;
  bookType: "ebook" | "physical";
  physicalType?: "library_use" | "borrowable";
  canBorrow: boolean;
  canRead: boolean;
  physicalCopiesAvailableCount?: number;
  physicalCopiesTotalCount?: number;
}
