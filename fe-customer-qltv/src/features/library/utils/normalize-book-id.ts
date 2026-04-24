import type { Book } from '@/types/book.type';


export function normalizeBookId(book: Pick<Book, 'id'>): string {
	const raw = book.id;
	if (raw == null || raw === '') return '';
	return String(raw).trim();
}
