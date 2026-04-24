import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

type BookShowcaseSectionProps<TBook> = {
  subtitle: string;
  title: string;
  description?: string;
  titleIcon?: ReactNode;
  books: TBook[];
  renderBook: (book: TBook, index: number) => ReactNode;
  onViewAll?: () => void;
  maxItems?: number;
  gridClassName?: string;
  className?: string;
  headerClassName?: string;
  viewAllButtonClassName?: string;
  
  emptyMessage?: string;
};

const DEFAULT_GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5 items-stretch";

export function BookShowcaseSection<TBook>({
  subtitle,
  title,
  description,
  titleIcon,
  books,
  renderBook,
  onViewAll,
  maxItems = 10,
  gridClassName = DEFAULT_GRID_CLASS,
  className = "mt-20",
  headerClassName = "flex justify-between items-end mb-10 gap-4 flex-wrap",
  viewAllButtonClassName = "flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all p-0 h-auto",
  emptyMessage,
}: Readonly<BookShowcaseSectionProps<TBook>>) {
  const { t } = useTranslation("pages");
  const visibleBooks = books.slice(0, maxItems);
  const hasBooks = visibleBooks.length > 0;

  return (
    <section className={className}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className={headerClassName}
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
            {subtitle}
          </span>
          <div className="mt-2 flex items-center gap-3">
            {titleIcon}
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {title}
            </h2>
          </div>
          {description && (
            <p className="text-xs text-muted-foreground font-medium mt-1.5">
              {description}
            </p>
          )}
        </div>
        {onViewAll && hasBooks && (
          <Button
            onClick={onViewAll}
            variant="link"
            className={viewAllButtonClassName}
          >
            {t("book.viewAll")}
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </Button>
        )}
      </motion.div>

      {hasBooks && (
        <div className={gridClassName}>
          {visibleBooks.map((book, index) => renderBook(book, index))}
        </div>
      )}
      {!hasBooks && emptyMessage && (
        <p className="rounded-xl border border-dashed border-border/80 bg-card/40 py-14 text-center text-sm font-medium text-muted-foreground">
          {emptyMessage}
        </p>
      )}
      {!hasBooks && !emptyMessage && <div className={gridClassName} />}
    </section>
  );
}
