import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { AUTH_KEYS } from "@/constants/auth";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronRight,
  BookmarkPlus,
  BookOpen,
  Heart,
  CheckCircle,
  Download,
  FileText,
  Hash,
  Building2,
  Calendar,
  BookCopy,
  Globe,
  Info,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookShowcaseSection } from "@/components/books/book-showcase-section";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useBookById, useBook } from "@/hooks/useBook";
import { useBookCategoryById } from "@/hooks/useBookCategory";
import { useBookAuthor, useAuthor } from "@/hooks/useBookAuthor";
import { useCreateReservation } from "@/hooks/useReservation";
import { useEbookByBookId, useIncrementDownloadCount } from "@/hooks/useEbook";
import { toast } from "sonner";
import { premiumEasing } from "@/lib/animation";
import {
  StarRating,
  DifficultyIndicator,
  RelatedBookCard,
} from "@/features/book-detail/detail-widgets";
import { mapBookToDisplay } from "@/features/book-detail/map-book-to-display";
import {
  FALLBACK_RELATED_COVER,
  shuffleArray,
} from "@/features/book-detail/related-books-utils";

const fadeInUp = {
  initial: { y: 24, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.7, ease: premiumEasing },
};

export function BookDetailPage() {
  const { t } = useTranslation("pages");
  const { id: bookId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookIdStr = bookId || "";
  const [ebookModalOpen, setEbookModalOpen] = useState(false);

  const { book: bookData, bookLoading } = useBookById(bookIdStr);

  const detailMainCategoryId =
    bookData?.mainCategoryId?.trim() ||
    bookData?.mainCategory?.id?.trim() ||
    "";

  const { category: detailMainCategory } =
    useBookCategoryById(detailMainCategoryId);

  const detailParentCategoryId =
    bookData?.mainCategory?.parentId?.trim() ||
    detailMainCategory?.parentId?.trim() ||
    "";

  const { category: detailParentCategory } = useBookCategoryById(
    detailParentCategoryId,
  );

  const { books: allBooksResponse } = useBook({ limit: 50 });

  const { bookAuthors: bookAuthorsResponse } = useBookAuthor({ limit: 200 });
  const { authors: authorsResponse } = useAuthor({ limit: 100 });

  const { createReservation, isCreating } = useCreateReservation();

  const { ebook: ebookData } = useEbookByBookId(bookIdStr);
  const { incrementDownload, isIncrementing } = useIncrementDownloadCount();

  const displayBook = useMemo(() => {
    if (!bookData) return null;

    const authorMap = new Map<string, string>();
    authorsResponse?.data?.forEach((author) => {
      if (author.id) {
        authorMap.set(author.id, author.authorName);
      }
    });

    const authorIds =
      bookAuthorsResponse?.data
        ?.filter((ba) => ba.bookId === bookIdStr)
        .map((ba) => ba.authorId) || [];

    const authorNames =
      authorIds
        .map((id) => authorMap.get(id) || t("bookDetail.unknownAuthor"))
        .join(", ") || t("bookDetail.unknownAuthor");

    return mapBookToDisplay(bookData, authorNames, t);
  }, [bookData, bookAuthorsResponse?.data, authorsResponse?.data, bookIdStr, t]);

  const bookCategoryTags = useMemo(() => {
    if (!bookData) return [];
    const parentName = detailParentCategory?.name?.trim();
    const childName = (
      bookData.mainCategory?.name ||
      bookData.mainCategoryName ||
      detailMainCategory?.name
    )?.trim();
    const tags: string[] = [];
    if (parentName) tags.push(parentName);
    if (childName && childName !== parentName) tags.push(childName);
    if (tags.length === 0 && childName) tags.push(childName);
    if (tags.length === 0) return [t("bookDetail.uncategorized")];
    return tags;
  }, [bookData, detailMainCategory, detailParentCategory, t]);

  const handleDownloadEbook = useCallback(() => {
    if (!ebookData?.filePath || !ebookData?.id) return;

    const fileUrl = ebookData.filePath;
    const extFromFormat = ebookData.fileFormat
      ?.replace(/^\./, "")
      .toLowerCase();
    const extFromUrl = fileUrl.split("?")[0].match(/\.([a-z0-9]+)$/i)?.[1];
    const ext = extFromFormat || extFromUrl || "pdf";
    const baseName = (displayBook?.title || "ebook").replace(
      /[/\\?%*:|"<>]/g,
      "-",
    );
    const filename = `${baseName}.${ext}`;

    incrementDownload(ebookData.id, {
      onSuccess: async () => {
        try {
          const response = await fetch(fileUrl);
          if (!response.ok) throw new Error("Fetch failed");
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
          toast.success(t("bookDetail.dlStarting"));
        } catch {
          toast.error(t("bookDetail.dlFail"), {
            description: t("bookDetail.dlFailDesc"),
          });
        }
      },
      onError: () => {
        toast.error(t("bookDetail.dlFail"), {
          description: t("bookDetail.dlFailDesc"),
        });
      },
    });
  }, [ebookData, incrementDownload, displayBook?.title, t]);

  const handleReadEbook = useCallback(() => {
    if (!ebookData?.filePath) return;
    setEbookModalOpen(false);
    navigate(`/reader/${bookIdStr}`);
  }, [ebookData, navigate, bookIdStr]);

  const relatedBooks = useMemo(() => {
    const allBooks = allBooksResponse?.data ?? [];
    if (!bookData || allBooks.length === 0) return [];

    const authorMap = new Map<string, string>();
    authorsResponse?.data?.forEach((author) => {
      if (author.id) {
        authorMap.set(author.id, author.authorName);
      }
    });

    const bookAuthorIdsMap = new Map<string, string[]>();
    bookAuthorsResponse?.data?.forEach((ba) => {
      if (ba.bookId && ba.authorId) {
        const existing = bookAuthorIdsMap.get(ba.bookId) || [];
        existing.push(ba.authorId);
        bookAuthorIdsMap.set(ba.bookId, existing);
      }
    });

    const sameCategoryBooks = allBooks.filter(
      (b) => b.mainCategoryId === bookData.mainCategoryId && b.id !== bookIdStr,
    );

    return shuffleArray(sameCategoryBooks)
      .slice(0, 16)
      .map((book) => {
        const authorIds = bookAuthorIdsMap.get(book.id || "") || [];
        const authorNames =
          authorIds
            .map((id) => authorMap.get(id) || t("bookDetail.unknownAuthor"))
            .join(", ") || t("bookDetail.unknownAuthor");

        return {
          id: book.id || "",
          title: book.title,
          author: authorNames,
          cover: book.coverImage || FALLBACK_RELATED_COVER,
        };
      });
  }, [
    bookData,
    allBooksResponse?.data,
    bookAuthorsResponse?.data,
    authorsResponse?.data,
    bookIdStr,
    t,
  ]);

  const handleBorrowBook = () => {
    if (!bookIdStr) return;

    const readerStr = localStorage.getItem(AUTH_KEYS.READER);
    if (!readerStr) {
      toast.error(t("bookDetail.readerMissing"), {
        description: t("bookDetail.readerMissingDesc"),
      });
      return;
    }

    const reader = JSON.parse(readerStr) as { id?: string };

    if (!reader.id) {
      toast.error(t("bookDetail.readerMissing"), {
        description: t("bookDetail.readerMissingDesc"),
      });
      return;
    }

    createReservation(
      { bookId: bookIdStr, readerId: reader.id },
      {
        onSuccess: () => {
          toast.success(t("bookDetail.reserveOk"));
          navigate("/history-reservation");
        },
        onError: () => {
          toast.error(t("bookDetail.reserveFail"), {
            description: t("bookDetail.reserveFailDesc"),
          });
        },
      },
    );
  };

  if (bookLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
        {t("bookDetail.loading")}
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1,
          },
        },
      }}
      className={displayBook?.canBorrow ? "pb-28 lg:pb-20" : "pb-24 lg:pb-20"}
    >
      <motion.nav
        variants={fadeInUp}
        className="flex items-center gap-2 mb-10 text-xs font-bold uppercase tracking-[0.15em] text-primary/70"
      >
        <a className="hover:text-primary transition-colors" href="#">
          {t("bookDetail.library")}
        </a>
        <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
        <a className="hover:text-primary transition-colors" href="#">
          {displayBook?.category || t("bookDetail.categoryFallback")}
        </a>
        <ChevronRight className="w-3 h-3" strokeWidth={2.5} />
        <span className="text-muted-foreground">
          {t("bookDetail.breadcrumbDetail")}
        </span>
      </motion.nav>

      
      <div className="mb-16 mx-auto grid max-w-5xl grid-cols-1 gap-10 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:max-w-6xl xl:gap-14">
        <motion.div
          variants={fadeInUp}
          className="flex w-full flex-col items-center gap-5 lg:sticky lg:top-20 lg:z-10 lg:items-stretch"
        >
          <div className="w-full max-w-[260px] lg:max-w-none">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
              <div className="relative aspect-3/4 w-full overflow-hidden">
                <img
                  alt={displayBook?.title || t("bookDetail.coverAlt")}
                  src={displayBook?.cover}
                  className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-105"
                />
                <div className="absolute top-2 left-2">
                  <span className="rounded-md border border-border bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-foreground shadow-sm backdrop-blur-sm">
                    {displayBook?.grade}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md space-y-3 rounded-2xl border border-primary/15 bg-linear-to-br from-card via-card to-primary/6 p-5 shadow-md shadow-primary/8 ring-1 ring-border/40 dark:to-primary/9 lg:max-w-none">
            {displayBook?.canBorrow && (
              <div className="flex flex-row items-stretch gap-3">
                <Button
                  onClick={handleBorrowBook}
                  disabled={isCreating || !bookIdStr}
                  className="min-h-10 h-10 min-w-0 flex-1 rounded-lg px-3 font-semibold shadow-sm shadow-primary/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <BookmarkPlus className="size-4 shrink-0" strokeWidth={2.5} />
                  <span className="truncate text-sm">
                    {isCreating
                      ? t("bookDetail.processing")
                      : t("bookDetail.reserve")}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="min-h-10 h-10 min-w-0 flex-1 rounded-lg border-2 border-primary/25 bg-background/90 px-3 font-semibold hover:border-primary/45 hover:bg-primary/10"
                >
                  <Heart className="size-4 shrink-0" strokeWidth={2} />
                  <span className="text-sm">{t("bookDetail.save")}</span>
                </Button>
              </div>
            )}
            {displayBook?.canRead && (
              <div className="flex flex-row items-stretch gap-3">
                <Button
                  onClick={() => setEbookModalOpen(true)}
                  className="min-h-10 h-10 min-w-0 flex-1 rounded-lg border border-primary/30 bg-primary px-3 font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-[box-shadow,transform] hover:bg-primary/92 hover:shadow-md hover:shadow-primary/20"
                >
                  <BookOpen className="size-4 shrink-0" strokeWidth={2} />
                  <span className="text-sm">{t("bookDetail.preview")}</span>
                </Button>
                {!displayBook?.canBorrow && (
                  <Button
                    variant="outline"
                    className="min-h-10 h-10 min-w-0 flex-1 rounded-lg border-2 border-primary/25 bg-background/90 px-3 font-semibold hover:border-primary/45 hover:bg-primary/10"
                  >
                    <Heart className="size-4 shrink-0" strokeWidth={2} />
                    <span className="text-sm">{t("bookDetail.save")}</span>
                  </Button>
                )}
              </div>
            )}
            {!displayBook?.canBorrow && !displayBook?.canRead && (
              <Button
                variant="outline"
                className="min-h-10 h-10 w-full rounded-lg border-2 border-primary/25 bg-background/90 px-3 font-semibold hover:border-primary/45 hover:bg-primary/10"
              >
                <Heart className="size-4 shrink-0" strokeWidth={2} />
                <span className="text-sm">{t("bookDetail.save")}</span>
              </Button>
            )}
          </div>
        </motion.div>

        <motion.div variants={fadeInUp} className="min-w-0">
          <div className="space-y-8">
            <header className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {displayBook?.canRead ? (
                  <span className="flex items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-bold text-secondary-foreground">
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t("bookDetail.ebook")}
                  </span>
                ) : displayBook?.canBorrow ? (
                  <span className="flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary">
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t("bookDetail.canBorrow")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 rounded-md border border-border bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground">
                    <CheckCircle className="w-3.5 h-3.5" strokeWidth={2.5} />
                    {t("bookDetail.libraryOnly")}
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-[2.35rem] lg:leading-tight">
                {displayBook?.title}
              </h1>
              <p className="text-lg font-semibold text-primary sm:text-xl">
                {displayBook?.author}
              </p>

              <div className="flex flex-wrap gap-2">
                {bookCategoryTags.map((tag, index) => (
                  <motion.span
                    key={`${tag}-${index}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                    className="rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {tag}
                  </motion.span>
                ))}
              </div>
            </header>

            {displayBook && (
              <motion.dl
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-1 gap-x-10 gap-y-3 rounded-xl border border-border/60 bg-muted/25 p-5 text-sm sm:grid-cols-2"
              >
                <div className="flex gap-3 sm:col-span-2">
                  <Hash
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div className="min-w-0">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("bookDetail.isbn")}
                    </dt>
                    <dd className="break-all font-medium text-foreground">
                      {displayBook.bookCode}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Building2
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("bookDetail.publisher")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      {displayBook.publisher}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Calendar
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("bookDetail.year")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      {displayBook.year}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <BookCopy
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("bookDetail.pages")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      {t("bookDetail.pageCountDisplay", {
                        count: displayBook.pages,
                      })}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Globe
                    className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <div>
                    <dt className="text-xs font-medium text-muted-foreground">
                      {t("bookDetail.language")}
                    </dt>
                    <dd className="font-medium text-foreground">
                      {displayBook.language}
                    </dd>
                  </div>
                </div>
                {displayBook.bookType === "physical" &&
                  displayBook.physicalCopiesTotalCount !== undefined && (
                    <div className="flex gap-3 sm:col-span-2">
                      <Layers
                        className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                        strokeWidth={2}
                      />
                      <div className="mt-0.5 min-w-0">
                        <dt className="text-xs font-medium text-muted-foreground">
                          {t("bookDetail.copies")}
                        </dt>
                        <dd className="font-medium text-foreground">
                          <span className="tabular-nums">
                            {displayBook.physicalCopiesAvailableCount ?? 0} /{" "}
                            {displayBook.physicalCopiesTotalCount}
                          </span>
                          <span className="text-muted-foreground">
                            {t("bookDetail.copyUnit")}
                          </span>
                          {(displayBook.physicalCopiesAvailableCount ?? 0) ===
                            0 &&
                            (displayBook.physicalCopiesTotalCount ?? 0) > 0 && (
                              <span className="mt-1 block text-xs font-normal text-amber-700 dark:text-amber-500/90">
                                {t("bookDetail.noBorrowable")}
                              </span>
                            )}
                        </dd>
                      </div>
                    </div>
                  )}
              </motion.dl>
            )}

            {displayBook && (
              <div className="flex gap-2 rounded-lg border border-border/70 bg-primary/5 px-3 py-2.5">
                <Info
                  className="mt-0.5 size-4 shrink-0 text-primary"
                  strokeWidth={2}
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {displayBook.canBorrow && (
                    <span>{t("bookDetail.hintPhysical")}</span>
                  )}
                  {displayBook.canRead && !displayBook.canBorrow && (
                    <span>{t("bookDetail.hintEbook")}</span>
                  )}
                  {!displayBook.canBorrow && !displayBook.canRead && (
                    <span>{t("bookDetail.hintInLibrary")}</span>
                  )}
                </p>
              </div>
            )}

            <motion.section
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.28 }}
              className="space-y-3"
            >
              <h2 className="ml-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-primary">
                {t("bookDetail.intro")}
              </h2>
              <p className="ml-1.5 max-w-[65ch] text-sm leading-[1.7] text-muted-foreground">
                {displayBook?.description}
              </p>
            </motion.section>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="flex flex-wrap items-center gap-6 rounded-xl border border-border/70 bg-card/80 p-5 md:gap-10 md:p-6"
            >
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  {t("bookDetail.rating")}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xl font-black text-foreground">
                    {displayBook?.rating}
                  </span>
                  <StarRating rating={displayBook?.rating || 0} />
                </div>
              </div>

              <div className="hidden sm:block w-px h-12 bg-border shrink-0" />

              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  {t("bookDetail.borrows")}
                </span>
                <span className="text-3xl font-black text-foreground">
                  {displayBook?.borrowCount}+
                </span>
              </div>

              <div className="hidden sm:block w-px h-12 bg-border shrink-0" />

              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary mb-1">
                  {t("bookDetail.difficulty")}
                </span>
                <DifficultyIndicator level={displayBook?.difficulty || 0} />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <BookShowcaseSection
        subtitle={t("bookDetail.relatedSubtitle")}
        title={t("bookDetail.relatedTitle")}
        books={relatedBooks}
        maxItems={10}
        emptyMessage={t("bookDetail.relatedEmpty")}
        onViewAll={() => {
          const categoryId = bookData?.mainCategoryId;
          if (categoryId) {
            navigate(`/library?category=${encodeURIComponent(categoryId)}`);
            return;
          }
          navigate("/library");
        }}
        renderBook={(book, index) => (
          <RelatedBookCard
            key={`${book.id || "noid"}-${index}`}
            book={book}
            index={index}
            authorPrefix={t("bookDetail.authorPrefix")}
            onClick={() => navigate(`/book/${book.id}`)}
          />
        )}
      />

      {displayBook?.canBorrow && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
          <div className="mx-auto flex max-w-lg gap-3">
            <Button
              onClick={handleBorrowBook}
              disabled={isCreating || !bookIdStr}
              className="min-h-10 h-10 min-w-0 flex-1 rounded-md px-2 font-semibold disabled:opacity-50"
            >
              <BookmarkPlus className="size-4 shrink-0" strokeWidth={2.5} />
              <span className="truncate text-sm">
                {isCreating
                  ? t("bookDetail.processing")
                  : t("bookDetail.registerBorrow")}
              </span>
            </Button>
            <Button
              variant="outline"
              className="min-h-10 h-10 min-w-0 flex-1 rounded-md border-2 border-border px-2 font-semibold"
            >
              <Heart className="size-4 shrink-0" strokeWidth={2} />
              <span className="text-sm">{t("bookDetail.save")}</span>
            </Button>
          </div>
        </div>
      )}

      
      <Dialog open={ebookModalOpen} onOpenChange={setEbookModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5 text-primary" />
              {t("bookDetail.ebook")}
            </DialogTitle>
            <DialogDescription>{displayBook?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            
            <div className="flex gap-4 p-3 bg-muted/50 rounded-lg border border-border">
              <img
                src={displayBook?.cover}
                alt={displayBook?.title}
                className="w-16 h-22 object-cover rounded-md border border-border shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-foreground line-clamp-2">
                  {displayBook?.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {displayBook?.author}
                </p>
                {ebookData && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold uppercase">
                      {ebookData.fileFormat || "PDF"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">
                      {ebookData.fileSize
                        ? `${(ebookData.fileSize / (1024 * 1024)).toFixed(1)} MB`
                        : "N/A"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-muted text-muted-foreground rounded-full font-medium">
                      {t("bookDetail.downloads", {
                        count: ebookData.downloadCount || 0,
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            
            <div className="flex flex-col gap-2.5">
              <Button
                onClick={handleDownloadEbook}
                disabled={isIncrementing || !ebookData?.filePath}
                className="w-full h-11 rounded-lg font-semibold gap-2.5 text-sm"
              >
                <Download className="size-4" strokeWidth={2.5} />
                {isIncrementing
                  ? t("bookDetail.processing")
                  : t("bookDetail.download")}
              </Button>
              <Button
                onClick={handleReadEbook}
                disabled={!ebookData?.filePath}
                variant="outline"
                className="w-full h-11 rounded-lg font-semibold gap-2.5 text-sm border-2"
              >
                <BookOpen className="size-4" strokeWidth={2} />
                {t("bookDetail.readNow")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
