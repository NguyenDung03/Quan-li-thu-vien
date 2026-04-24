import type { TFunction } from "i18next";
import type { Book } from "@/types/book.type";
import type { BookDisplay } from "./types";

export function mapBookToDisplay(
  book: Book,
  authorNames: string,
  t: TFunction<"pages">,
): BookDisplay {
  const categoryLabel =
    book.mainCategory?.name?.trim() ||
    book.mainCategoryName?.trim() ||
    t("mapBook.textbook");
  const gradeLabels =
    book.bookGradeLevels
      ?.map((row) => row.gradeLevel?.name?.trim())
      .filter((name): name is string => Boolean(name)) ?? [];
  const grade =
    gradeLabels.length > 0 ? gradeLabels.join(", ") : t("bookDetail.noGrade");
  const isEbook = book.bookType === "ebook";
  const isBorrowable = book.physicalType === "borrowable";

  return {
    id: book.id || "",
    title: book.title,
    author: authorNames,
    cover:
      book.coverImage ||
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDpqOwvcVaCRlG_pKJqXNIqv8DWFdyBInAnKVR6zCgvnJkxBoez41Sa6GcWzmvRLephlZhkdxTPrWJr35q2RfYx0fnCkvSdbyycQs6KjLjhm0Hy3mLfkypSFYj6G4ZisFBECWquxjAabjaYOUhg5vtvro0fNB3OiWjAql7jTdnduf7PNkvVN0PWs4HH8U_G8sAetDttWmy7VZXkstBKm0hsz8HBO7ETSGXhRD1gC1oNcWlJFzp5UbcwtbMIla4C9BtTmXU9-CVHhYDt",
    grade,
    category: categoryLabel,
    available: isEbook || isBorrowable,
    bookCode: book.isbn || t("bookDetail.notApplicable"),
    description: book.description || t("bookDetail.defaultDesc"),
    publisher: book.publisherName || t("bookDetail.publisherDefault"),
    year: book.publishYear || 2023,
    pages: book.pageCount || 300,
    language: book.language || t("bookDetail.langVi"),
    rating: 4.5,
    borrowCount: 850,
    difficulty: 3,
    bookType: book.bookType,
    physicalType: book.physicalType,
    canBorrow: !isEbook && isBorrowable,
    canRead: isEbook,
    physicalCopiesAvailableCount: book.physicalCopiesAvailableCount,
    physicalCopiesTotalCount: book.physicalCopiesTotalCount,
  };
}
