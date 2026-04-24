import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useBook } from '@/hooks/useBook';
import { useBookAuthor, useAuthor } from '@/hooks/useBookAuthor';
import { useBookCategory } from '@/hooks/useBookCategory';
import { useGradeLevel } from '@/hooks/useGradeLevel';
import { dedupeBooksById } from '@/features/library/utils/dedupe-books-by-id';
import { mapBooksWithAuthors } from '@/features/library/utils/map-book-to-display';
import type { BookDisplay } from '@/types/book.type';

export function useLibraryBookCatalog() {
	const { t } = useTranslation('pages');
	const {
		books: borrowableBooksResponse,
		booksLoading: borrowableBooksLoading,
	} = useBook({ limit: 100, availablePhysical: 'true' });

	const {
		books: libraryUseBooksResponse,
		booksLoading: libraryUseBooksLoading,
	} = useBook({ limit: 100, physicalType: 'library_use' });

	const { books: ebookBooksResponse, booksLoading: ebookBooksLoading } = useBook(
		{ limit: 100, bookType: 'ebook' },
	);

	const booksLoading =
		borrowableBooksLoading || libraryUseBooksLoading || ebookBooksLoading;

	const { bookAuthors: bookAuthorsResponse } = useBookAuthor({ limit: 200 });
	const { authors: authorsResponse } = useAuthor({ limit: 100 });

	const { gradeLevels, gradeLevelsLoading } = useGradeLevel({ limit: 100 });
	const { categories, categoriesLoading } = useBookCategory({ all: true });

	const physicalBooksList = useMemo((): BookDisplay[] => {
		const borrowableData = borrowableBooksResponse?.data ?? [];
		const libraryUseData = libraryUseBooksResponse?.data ?? [];
		const combinedPhysical = [...borrowableData, ...libraryUseData];
		const allPhysical = dedupeBooksById(combinedPhysical);
		return mapBooksWithAuthors(
			allPhysical,
			authorsResponse?.data,
			bookAuthorsResponse?.data,
			t,
		);
	}, [borrowableBooksResponse, libraryUseBooksResponse, authorsResponse, bookAuthorsResponse, t]);

	const ebookBooksList = useMemo((): BookDisplay[] => {
		const dataRaw = ebookBooksResponse?.data ?? [];
		const data = dedupeBooksById(dataRaw);
		return mapBooksWithAuthors(
			data,
			authorsResponse?.data,
			bookAuthorsResponse?.data,
			t,
		);
	}, [ebookBooksResponse, authorsResponse, bookAuthorsResponse, t]);

	return {
		physicalBooksList,
		ebookBooksList,
		booksLoading,
		gradeLevels: gradeLevels?.data ?? [],
		categories: categories?.data ?? [],
		filtersLoading: gradeLevelsLoading || categoriesLoading,
	};
}
