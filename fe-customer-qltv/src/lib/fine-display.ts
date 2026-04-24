import type { Fine } from "@/types/fine.type";
import { readerDateLocale } from "@/lib/reader-locale";


type ApiBorrow = {
  id?: string;
  borrowDate?: string;
  dueDate?: string;
  copy?: { book?: { title?: string } };
  book?: { title?: string };
};

export type FineFromApi = Fine & { borrow?: ApiBorrow };

export function getFineBorrowRow(f: FineFromApi): {
  id: string;
  bookTitle?: string;
  borrowDate?: string;
  dueDate?: string;
} {
  if (f.borrowRecord) {
    return f.borrowRecord;
  }
  const b = f.borrow;
  if (!b) {
    return { id: f.borrowId };
  }
  const bookTitle = b.copy?.book?.title ?? b.book?.title;
  return {
    id: b.id ?? f.borrowId,
    bookTitle,
    borrowDate: b.borrowDate,
    dueDate: b.dueDate,
  };
}

export function formatFineTableDate(value: string | Date | undefined | null): string {
  if (value == null || value === "") {
    return "";
  }
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat(readerDateLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
