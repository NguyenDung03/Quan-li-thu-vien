import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, MonitorPlay } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { LibraryBookSection } from '@/features/library/components/library-book-section';
import { LibraryEmptyFiltered } from '@/features/library/components/library-empty-filtered';
import { LibraryFilterBar } from '@/features/library/components/library-filter-bar';
import { LibraryPageLoading } from '@/features/library/components/library-page-loading';
import { LibraryPagination } from '@/features/library/components/library-pagination';
import {
	LibrarySectionTabs,
	type LibraryActiveSection,
} from '@/features/library/components/library-section-tabs';
import { useLibraryBookCatalog } from '@/features/library/hooks/use-library-book-catalog';
import {
	LIBRARY_ROWS_FULL,
	LIBRARY_ROWS_PREVIEW,
	useLibraryGridColumns,
} from '@/features/library/hooks/use-library-grid-columns';
import { libraryFadeInUp } from '@/features/library/variants/motion';
import { filterLibraryBooks } from '@/features/library/utils/filter-library-books';
import { sliceBooksForView } from '@/features/library/utils/slice-books-for-view';

export default function LibraryPage() {
	const { t } = useTranslation('pages');
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();
	const selectedGrade = searchParams.get('grade');
	const selectedCategory = searchParams.get('category');

	const [activeSection, setActiveSection] = useState<LibraryActiveSection>('both');
	const [physicalViewMode, setPhysicalViewMode] = useState<'preview' | 'full'>(
		'preview',
	);
	const [ebookViewMode, setEbookViewMode] = useState<'preview' | 'full'>('preview');
	const [physicalPage, setPhysicalPage] = useState(1);
	const [ebookPage, setEbookPage] = useState(1);

	const resetPagination = useCallback(() => {
		setPhysicalPage(1);
		setEbookPage(1);
	}, []);

	const columnCount = useLibraryGridColumns({
		onColumnsChanged: resetPagination,
	});
	const pageSizePreview = columnCount * LIBRARY_ROWS_PREVIEW;
	const pageSizeFull = columnCount * LIBRARY_ROWS_FULL;

	const {
		physicalBooksList,
		ebookBooksList,
		booksLoading,
		gradeLevels,
		categories,
		filtersLoading,
	} = useLibraryBookCatalog();

	const filteredPhysicalBooks = useMemo(
		() => filterLibraryBooks(physicalBooksList, selectedGrade, selectedCategory),
		[physicalBooksList, selectedGrade, selectedCategory],
	);

	const filteredEbookBooks = useMemo(
		() => filterLibraryBooks(ebookBooksList, selectedGrade, selectedCategory),
		[ebookBooksList, selectedGrade, selectedCategory],
	);

	const physicalTotalPages = Math.ceil(
		filteredPhysicalBooks.length / pageSizeFull,
	);
	const ebookTotalPages = Math.ceil(filteredEbookBooks.length / pageSizeFull);

	const physicalDisplayBooks = useMemo(
		() =>
			sliceBooksForView(
				filteredPhysicalBooks,
				physicalViewMode,
				physicalPage,
				pageSizePreview,
				pageSizeFull,
			),
		[
			filteredPhysicalBooks,
			physicalViewMode,
			physicalPage,
			pageSizePreview,
			pageSizeFull,
		],
	);

	const ebookDisplayBooks = useMemo(
		() =>
			sliceBooksForView(
				filteredEbookBooks,
				ebookViewMode,
				ebookPage,
				pageSizePreview,
				pageSizeFull,
			),
		[
			filteredEbookBooks,
			ebookViewMode,
			ebookPage,
			pageSizePreview,
			pageSizeFull,
		],
	);

	const resetFiltersAndPagination = useCallback(() => {
		setPhysicalPage(1);
		setEbookPage(1);
		setPhysicalViewMode('preview');
		setEbookViewMode('preview');
	}, []);

	const handleSelectGrade = (gradeId: string | null) => {
		const params = new URLSearchParams(searchParams);
		if (gradeId) params.set('grade', gradeId);
		else params.delete('grade');
		setSearchParams(params);
		resetFiltersAndPagination();
	};

	const handleSelectCategory = (categoryId: string | null) => {
		const params = new URLSearchParams(searchParams);
		if (categoryId) params.set('category', categoryId);
		else params.delete('category');
		setSearchParams(params);
		resetFiltersAndPagination();
	};

	const handleClearFiltersUi = () => {
		handleSelectGrade(null);
		handleSelectCategory(null);
		navigate('/library');
	};

	if (booksLoading) {
		return <LibraryPageLoading />;
	}

	return (
		<motion.div
			initial="initial"
			animate="animate"
			variants={{
				animate: {
					transition: {
						staggerChildren: 0.08,
						delayChildren: 0.1,
					},
				},
			}}
			className="space-y-6 pb-20"
		>
			<LibraryFilterBar
				gradeLevels={gradeLevels}
				categories={categories}
				selectedGrade={selectedGrade}
				selectedCategory={selectedCategory}
				onSelectGrade={handleSelectGrade}
				onSelectCategory={handleSelectCategory}
				loading={filtersLoading}
			/>

			<Separator className="bg-border/60" />

			<LibrarySectionTabs
				activeSection={activeSection}
				onSelectAll={() => {
					setActiveSection('both');
					setPhysicalViewMode('preview');
					setEbookViewMode('preview');
					setPhysicalPage(1);
					setEbookPage(1);
				}}
				onSelectPhysical={() => {
					setActiveSection('physical');
					setPhysicalViewMode('full');
				}}
				onSelectEbook={() => {
					setActiveSection('ebook');
					setEbookViewMode('full');
				}}
			/>

			<div className="min-w-0 flex-1 space-y-4">
				{(activeSection === 'both' || activeSection === 'physical') && (
					<>
						<LibraryBookSection
							title={t('library.physical')}
							icon={BookMarked}
							books={physicalDisplayBooks}
							totalMatching={filteredPhysicalBooks.length}
							onViewAll={() => {
								setActiveSection('physical');
								setPhysicalViewMode('full');
								setPhysicalPage(1);
							}}
							showViewAll={filteredPhysicalBooks.length > pageSizePreview}
						/>

						{physicalViewMode === 'full' && (
							<LibraryPagination
								currentPage={physicalPage}
								totalPages={physicalTotalPages}
								onPageChange={setPhysicalPage}
								totalItems={filteredPhysicalBooks.length}
								pageSize={pageSizeFull}
							/>
						)}

						{activeSection === 'both' && (
							<motion.div variants={libraryFadeInUp} className="py-2">
								<Separator className="bg-linear-to-r from-transparent via-border to-transparent" />
							</motion.div>
						)}
					</>
				)}

				{(activeSection === 'both' || activeSection === 'ebook') && (
					<>
						<LibraryBookSection
							title={t('library.ebook')}
							icon={MonitorPlay}
							books={ebookDisplayBooks}
							totalMatching={filteredEbookBooks.length}
							onViewAll={() => {
								setActiveSection('ebook');
								setEbookViewMode('full');
								setEbookPage(1);
							}}
							showViewAll={filteredEbookBooks.length > pageSizePreview}
						/>

						{ebookViewMode === 'full' && (
							<LibraryPagination
								currentPage={ebookPage}
								totalPages={ebookTotalPages}
								onPageChange={setEbookPage}
								totalItems={filteredEbookBooks.length}
								pageSize={pageSizeFull}
							/>
						)}
					</>
				)}

				{filteredPhysicalBooks.length === 0 && filteredEbookBooks.length === 0 && (
					<LibraryEmptyFiltered onClearFilters={handleClearFiltersUi} />
				)}
			</div>
		</motion.div>
	);
}
