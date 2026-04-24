import { useTranslation } from 'react-i18next';
import { BookShowcaseSection } from '@/components/books/book-showcase-section';
import { LibraryBookCard } from '@/features/library/components/library-book-card';
import { BOOK_GRID_CLASS } from '@/features/library/constants';
import { libraryFadeInUp } from '@/features/library/variants/motion';
import type { BookDisplay } from '@/types/book.type';
import { motion } from 'framer-motion';
import type { ElementType } from 'react';

type LibraryBookSectionProps = {
  title: string;
  icon: ElementType;
  books: BookDisplay[];
  totalMatching: number;
  showViewAll: boolean;
  onViewAll: () => void;
};

export function LibraryBookSection({
  title,
  icon: Icon,
  books,
  totalMatching,
  showViewAll,
  onViewAll,
}: Readonly<LibraryBookSectionProps>) {
  const { t } = useTranslation('pages');
  return (
    <motion.section variants={libraryFadeInUp} className="mb-10 last:mb-0">
      {books.length > 0 ? (
        <BookShowcaseSection
          subtitle={t('library.sectionSubtitle')}
          title={title}
          description={t('library.matchCount', { count: totalMatching })}
          titleIcon={
            <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-primary" strokeWidth={2} />
            </div>
          }
          books={books}
          maxItems={books.length}
          gridClassName={BOOK_GRID_CLASS}
          className="mt-0"
          headerClassName="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8"
          viewAllButtonClassName="border-2 border-primary/20 text-primary font-bold rounded-md hover:bg-primary/5 hover:border-primary/40 transition-all duration-300 flex items-center gap-2 px-5 w-fit"
          onViewAll={showViewAll ? onViewAll : undefined}
          renderBook={(book, index) => (
            <LibraryBookCard
              key={`${book.id || 'noid'}-${index}`}
              book={book}
              index={index}
            />
          )}
        />
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
            <Icon className="w-8 h-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <p className="text-muted-foreground text-sm">{t('library.noBooks')}</p>
        </div>
      )}
    </motion.section>
  );
}
