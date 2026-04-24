import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import { getPaginationPageNumbers } from '@/features/library/utils/get-pagination-page-numbers';

type LibraryPaginationProps = {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	pageSize: number;
	onPageChange: (page: number) => void;
};

export function LibraryPagination({
	currentPage,
	totalPages,
	totalItems,
	pageSize,
	onPageChange,
}: LibraryPaginationProps) {
	const { t } = useTranslation('pages');
	if (totalPages <= 1) return null;

	const pages = getPaginationPageNumbers(totalPages, currentPage);
	const from = (currentPage - 1) * pageSize + 1;
	const to = Math.min(currentPage * pageSize, totalItems);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
			className="flex flex-col items-center gap-3 mt-10"
		>
			<Pagination>
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							onClick={() => onPageChange(currentPage - 1)}
							className={
								currentPage === 1
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>
					{pages.map((page, idx) =>
						page === '...' ? (
							<PaginationItem key={`ellipsis-${idx}`}>
								<span className="flex size-8 items-center justify-center">
									...
								</span>
							</PaginationItem>
						) : (
							<PaginationItem key={page}>
								<PaginationLink
									isActive={currentPage === page}
									onClick={() => onPageChange(page as number)}
									className="cursor-pointer"
								>
									{page}
								</PaginationLink>
							</PaginationItem>
						),
					)}
					<PaginationItem>
						<PaginationNext
							onClick={() => onPageChange(currentPage + 1)}
							className={
								currentPage === totalPages
									? 'pointer-events-none opacity-50'
									: 'cursor-pointer'
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
			<p className="text-xs text-muted-foreground">
				{t('library.paginationShow', { from, to, total: totalItems })}
			</p>
		</motion.div>
	);
}
