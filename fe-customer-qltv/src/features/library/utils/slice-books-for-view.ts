import type { BookDisplay } from '@/types/book.type';

type ViewMode = 'preview' | 'full';

export function sliceBooksForView(
	list: BookDisplay[],
	mode: ViewMode,
	page: number,
	pageSizePreview: number,
	pageSizeFull: number,
): BookDisplay[] {
	if (mode === 'preview') {
		return list.slice(0, pageSizePreview);
	}
	const start = (page - 1) * pageSizeFull;
	return list.slice(start, start + pageSizeFull);
}
