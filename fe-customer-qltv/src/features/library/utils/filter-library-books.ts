import type { BookDisplay } from '@/types/book.type';

function idMatches(a: string | undefined | null, b: string | null): boolean {
	if (b == null || b === '') return true;
	if (a == null || a === '') return false;
	return String(a).trim() === String(b).trim();
}

export function filterLibraryBooks(
	books: BookDisplay[],
	selectedGrade: string | null,
	selectedCategory: string | null,
): BookDisplay[] {
	return books.filter((book) => {
		if (selectedGrade) {
			const ids = [...(book.gradeLevelIds ?? [])];
			if (ids.length === 0 && book.gradeId) {
				ids.push(book.gradeId);
			}
			if (!ids.some((id) => idMatches(id, selectedGrade))) return false;
		}
		if (selectedCategory && !idMatches(book.categoryId, selectedCategory)) {
			return false;
		}
		return true;
	});
}
