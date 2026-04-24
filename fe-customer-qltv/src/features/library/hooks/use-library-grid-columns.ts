import { useEffect, useState } from 'react';


const BREAKPOINT_MIN_WIDTH = [
	{ min: 1680, cols: 8 },
	{ min: 1536, cols: 7 },
	{ min: 1280, cols: 6 },
	{ min: 1024, cols: 5 },
	{ min: 768, cols: 4 },
	{ min: 640, cols: 3 },
	{ min: 0, cols: 2 },
] as const;

export const LIBRARY_ROWS_PREVIEW = 1;
export const LIBRARY_ROWS_FULL = 2;

function getColumnCount(width: number): number {
	for (const { min, cols } of BREAKPOINT_MIN_WIDTH) {
		if (width >= min) return cols;
	}
	return 2;
}

type UseLibraryGridColumnsOptions = {
	
	onColumnsChanged?: () => void;
};

export function useLibraryGridColumns(options?: UseLibraryGridColumnsOptions) {
	const onColumnsChanged = options?.onColumnsChanged;

	const [columnCount, setColumnCount] = useState(() =>
		typeof window !== 'undefined' ? getColumnCount(window.innerWidth) : 2,
	);

	useEffect(() => {
		const syncWidth = () => {
			const next = getColumnCount(window.innerWidth);
			setColumnCount((prev) => {
				if (prev !== next) {
					queueMicrotask(() => onColumnsChanged?.());
				}
				return next;
			});
		};

		syncWidth();
		window.addEventListener('resize', syncWidth);
		return () => window.removeEventListener('resize', syncWidth);
	}, [onColumnsChanged]);

	return columnCount;
}
