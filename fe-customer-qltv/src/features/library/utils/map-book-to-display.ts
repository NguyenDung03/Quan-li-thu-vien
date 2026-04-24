import { LIBRARY_PLACEHOLDER_COVER } from '@/features/library/constants';
import { normalizeBookId } from '@/features/library/utils/normalize-book-id';
import type { Author, Book, BookAuthor, BookDisplay } from '@/types/book.type';
import type { TFunction } from 'i18next';

function collectGradeLevelIds(book: Book): string[] {
	const fromRows = book.bookGradeLevels
		?.map((row) => row.gradeLevelId || row.gradeLevel?.id)
		.filter((id): id is string => Boolean(id && String(id).trim()));
	if (fromRows?.length) return [...new Set(fromRows)];
	return [];
}

export function mapBookToDisplay(
	book: Book,
	authorNames: string,
	t: TFunction<'pages'>,
): BookDisplay {
	const id = normalizeBookId(book);
	const categoryLabel =
		book.mainCategory?.name?.trim() ||
		book.mainCategoryName?.trim() ||
		t('mapBook.textbook');
	const gradeLevelIds = collectGradeLevelIds(book);
	const gradeLabels =
		book.bookGradeLevels
			?.map((row) => row.gradeLevel?.name?.trim())
			.filter(Boolean) ?? [];
	const grade =
		gradeLabels.length > 0 ? gradeLabels.join(', ') : undefined;

	return {
		id,
		title: book.title,
		author: authorNames,
		cover: book.coverImage || LIBRARY_PLACEHOLDER_COVER,
		category: categoryLabel,
		categoryId: book.mainCategoryId,
		gradeLevelIds,
		gradeId: gradeLevelIds[0],
		grade,
		bookType: book.bookType,
		physicalType: book.physicalType,
		availableCopies: book.availableCopies,
	};
}

function buildAuthorMap(authors: Author[]): Map<string, string> {
	const map = new Map<string, string>();
	for (const author of authors) {
		if (author.id) map.set(author.id, author.authorName);
	}
	return map;
}

function buildBookAuthorIdsMap(rows: BookAuthor[]): Map<string, string[]> {
	const map = new Map<string, string[]>();
	for (const ba of rows) {
		if (!ba.bookId || !ba.authorId) continue;
		const bookId = String(ba.bookId).trim();
		if (!bookId) continue;
		const existing = map.get(bookId) ?? [];
		existing.push(ba.authorId);
		map.set(bookId, existing);
	}
	return map;
}


export function mapBooksWithAuthors(
	books: Book[],
	authors: Author[] | undefined | null,
	bookAuthors: BookAuthor[] | undefined,
	t: TFunction<'pages'>,
): BookDisplay[] {
	
	if (!books.length || authors == null) return [];

	const authorMap = buildAuthorMap(authors);
	const bookAuthorIdsMap = buildBookAuthorIdsMap(bookAuthors ?? []);

	return books.map((book) => {
		const authorIds = bookAuthorIdsMap.get(normalizeBookId(book)) ?? [];
		const authorNames =
			authorIds.map((id) => authorMap.get(id) || t('mapBook.unknownAuthor')).join(', ') ||
			t('mapBook.unknownAuthor');
		return mapBookToDisplay(book, authorNames, t);
	});
}
