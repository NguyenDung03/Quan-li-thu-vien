
export function getPaginationPageNumbers(
	totalPages: number,
	currentPage: number,
	delta = 2,
): (number | string)[] {
	const pages: (number | string)[] = [];

	for (let i = 1; i <= totalPages; i++) {
		if (
			i === 1 ||
			i === totalPages ||
			(i >= currentPage - delta && i <= currentPage + delta)
		) {
			pages.push(i);
		} else if (pages[pages.length - 1] !== '...') {
			pages.push('...');
		}
	}

	return pages;
}
