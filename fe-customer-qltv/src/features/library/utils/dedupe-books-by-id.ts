import type { Book } from '@/types/book.type';
import { normalizeBookId } from '@/features/library/utils/normalize-book-id';

function mergeBookRow(existing: Book, incoming: Book): Book {
	const anyBorrowable =
		existing.physicalType === 'borrowable' ||
		incoming.physicalType === 'borrowable';
	const physicalType = anyBorrowable
		? 'borrowable'
		: existing.physicalType === 'library_use' ||
				incoming.physicalType === 'library_use'
			? 'library_use'
			: incoming.physicalType ?? existing.physicalType;

	const maxCopies = Math.max(
		existing.availableCopies ?? 0,
		incoming.availableCopies ?? 0,
	);

	const canonId = normalizeBookId(existing) || normalizeBookId(incoming);

	return {
		...existing,
		...incoming,
		...(canonId ? { id: canonId } : {}),
		physicalType,
		availableCopies:
			maxCopies > 0
				? maxCopies
				: (incoming.availableCopies ?? existing.availableCopies),
	};
}


export function dedupeBooksById(books: Book[]): Book[] {
	const merged = new Map<string, Book>();
	for (const book of books) {
		const id = normalizeBookId(book);
		if (!id) continue;
		const prev = merged.get(id);
		merged.set(id, prev ? mergeBookRow(prev, book) : { ...book, id });
	}

	const seen = new Set<string>();
	const out: Book[] = [];

	for (const book of books) {
		const id = normalizeBookId(book);
		if (!id) {
			out.push(book);
			continue;
		}
		if (seen.has(id)) continue;
		seen.add(id);
		const row = merged.get(id);
		if (row) out.push(row);
	}

	return out;
}
