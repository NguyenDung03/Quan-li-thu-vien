import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { EbookReader } from "@/components/ebook-reader/ebook-reader";
import { useBookById } from "@/hooks/useBook";
import { useEbookByBookId } from "@/hooks/useEbook";
import { motion } from "framer-motion";
import {
  Settings,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Minus,
  Plus,
  BookMarked,
  Hash,
  Globe,
  Building2,
  Layers,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { premiumEasing } from "@/lib/animation";
import {
  readerFallbackMeta,
  readerMockChapters,
} from "@/features/reader/fallback-content";

type ReaderTheme = "light" | "sepia";

function isPdfEbook(filePath: string | undefined, fileFormat: string | undefined) {
  if (!filePath) return false;
  const fmt = (fileFormat || "").toLowerCase().replace(/^\./, "");
  const base = filePath.toLowerCase().split("?")[0];
  return fmt.includes("pdf") || base.endsWith(".pdf");
}

function formatEbookSize(bytes: number | undefined): string | undefined {
  if (bytes == null || bytes <= 0) return undefined;
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReaderPage() {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();
  const { bookId = "" } = useParams<{ bookId: string }>();
  const { book, bookLoading, bookError } = useBookById(bookId);
  const { ebook, ebookLoading, ebookError } = useEbookByBookId(bookId);

  const displayMeta = useMemo(() => {
    const emptyExtra = {
      isbn: undefined as string | undefined,
      language: undefined as string | undefined,
      publisherName: undefined as string | undefined,
      edition: undefined as string | undefined,
      description: undefined as string | undefined,
      bookTypeLabel: undefined as string | undefined,
      ebookFormat: undefined as string | undefined,
      ebookSizeLabel: undefined as string | undefined,
    };

    if (bookLoading && !book) {
      return {
        ...readerFallbackMeta,
        ...emptyExtra,
        title: t("reader.loadingBook"),
        author: "…",
        bookTypeLabel: "—",
      };
    }
    if (book) {
      const author =
        book.authors
          ?.map((a) => a.authorName)
          .filter(Boolean)
          .join(", ") || t("reader.unknownAuthor");
      const grade =
        book.bookGradeLevels
          ?.map((g) => g.gradeLevel?.name)
          .filter(Boolean)
          .join(", ") || readerFallbackMeta.grade;
      const category =
        book.mainCategoryName ||
        book.mainCategory?.name ||
        readerFallbackMeta.category;
      return {
        title: book.title,
        author,
        year: book.publishYear?.toString() ?? readerFallbackMeta.year,
        grade,
        pages: book.pageCount
          ? t("reader.pagesWithUnit", { count: book.pageCount })
          : readerFallbackMeta.pages,
        category,
        cover: book.coverImage || readerFallbackMeta.cover,
        isbn: book.isbn?.trim() || undefined,
        language: book.language?.trim() || undefined,
        publisherName: book.publisherName?.trim() || undefined,
        edition: book.edition?.trim() || undefined,
        description: book.description?.trim() || undefined,
        bookTypeLabel:
          book.bookType === "ebook" ? t("reader.ebook") : t("reader.paper"),
        ebookFormat: ebook?.fileFormat
          ? ebook.fileFormat.replace(/^\./, "").toUpperCase()
          : undefined,
        ebookSizeLabel: formatEbookSize(ebook?.fileSize),
      };
    }
    return { ...readerFallbackMeta, ...emptyExtra, bookTypeLabel: "—" };
  }, [book, bookLoading, ebook, t]);

  const showPdfViewer =
    !!ebook?.filePath &&
    isPdfEbook(ebook.filePath, ebook.fileFormat) &&
    !ebookLoading &&
    !ebookError;

  const [fontSize, setFontSize] = useState(100);
  const [themeMode, setThemeMode] = useState<ReaderTheme>("light");

  const themeClasses: Record<
    ReaderTheme,
    {
      bg: string;
      content: string;
      text: string;
      muted: string;
      border: string;
      coverFrame: string;
    }
  > = {
    light: {
      bg: "bg-[#f8f9fa]",
      content: "bg-white",
      text: "text-slate-900",
      muted: "text-slate-500",
      border: "border-slate-100",
      coverFrame: "bg-white",
    },
    sepia: {
      bg: "bg-[#f4ecd8]",
      content: "bg-[#faf6ed]",
      text: "text-[#5b4636]",
      muted: "text-[#8b7355]",
      border: "border-[#d4c4a8]",
      coverFrame: "bg-[#faf6ed]",
    },
  };

  const currentTheme = themeClasses[themeMode];

  const detailSurface =
    themeMode === "light"
      ? "border-slate-100/80 bg-slate-50/80"
      : "border-[#d4c4a8]/80 bg-[#f0e8d8]/50";

  const heroMetaItems = useMemo(
    () =>
      [
        { icon: Hash, label: t("reader.isbnLabel"), value: displayMeta.isbn },
        { icon: Globe, label: t("reader.lang"), value: displayMeta.language },
        {
          icon: Building2,
          label: t("reader.publisher"),
          value: displayMeta.publisherName,
        },
        { icon: Layers, label: t("reader.edition"), value: displayMeta.edition },
        { icon: BookMarked, label: t("reader.grade"), value: displayMeta.grade },
        { icon: FileText, label: t("reader.pages"), value: displayMeta.pages },
        { icon: FileText, label: t("reader.category"), value: displayMeta.category },
        {
          icon: FileText,
          label: t("reader.bookType"),
          value:
            displayMeta.bookTypeLabel &&
            displayMeta.bookTypeLabel.trim() !== "—"
              ? displayMeta.bookTypeLabel
              : undefined,
        },
        ...(displayMeta.ebookFormat || displayMeta.ebookSizeLabel
          ? [
              {
                icon: FileText,
                label: t("reader.ebookFile"),
                value: [displayMeta.ebookFormat, displayMeta.ebookSizeLabel]
                  .filter(Boolean)
                  .join(" · "),
              },
            ]
          : []),
      ].filter((item) => item.value && String(item.value).trim().length > 0),
    [displayMeta, t],
  );

  const pubLineParts = useMemo(() => {
    const parts: string[] = [];
    const pub = displayMeta.publisherName?.trim();
    if (pub) parts.push(pub);
    const y = displayMeta.year?.toString().trim();
    if (y) parts.push(t("reader.editionYear", { year: y }));
    const ed = displayMeta.edition?.trim();
    if (ed) parts.push(ed);
    return parts;
  }, [
    displayMeta.publisherName,
    displayMeta.year,
    displayMeta.edition,
    t,
  ]);

  return (
    <div
      className={`relative flex h-screen flex-col overflow-hidden ${currentTheme.bg}`}
    >
      
      <div className="flex flex-1 overflow-hidden">
        
        <main
          className={`flex-1 flex flex-col overflow-y-auto ${currentTheme.bg}`}
        >
          
          <div className="w-full max-w-5xl mx-auto">
            
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-4 pb-4 pt-5 sm:px-6 sm:pb-6 sm:pt-7"
            >
              <Button
                variant="ghost"
                onClick={() => navigate(-1)}
                className={`mb-5 -ml-1 h-10 gap-2 rounded-xl px-3 ${currentTheme.muted} hover:bg-[#18AD5B]/10 hover:text-[#18AD5B]`}
              >
                <ArrowLeft className="h-4 w-4 shrink-0" strokeWidth={2} />
                <span className="text-sm font-medium">{t("reader.back")}</span>
              </Button>

              <div
                className={`overflow-hidden rounded-3xl border shadow-sm ${currentTheme.border} ${currentTheme.content}`}
              >
                <div className="h-1 bg-linear-to-r from-[#18AD5B] to-[#46C37B]" />

                <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-[minmax(0,12.5rem)_1fr] lg:items-start lg:gap-12">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.25, ease: premiumEasing }}
                    className="mx-auto w-full max-w-50 shrink-0 lg:mx-0 lg:max-w-none"
                  >
                    <div
                      className={`rounded-2xl p-2 shadow-md ring-1 ring-black/6 ${currentTheme.coverFrame}`}
                    >
                      <div className="aspect-3/4 overflow-hidden rounded-xl bg-slate-200 shadow-inner">
                        <img
                          alt={t("reader.coverAlt")}
                          className="h-full w-full object-cover"
                          src={displayMeta.cover}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <div className="min-w-0 space-y-5 text-center lg:text-left">
                    <nav
                      aria-label="Breadcrumb"
                      className="flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#18AD5B] lg:justify-start"
                    >
                      <span className="whitespace-nowrap">
                        {t("reader.library")}
                      </span>
                      <ChevronRight
                        className="h-3 w-3 shrink-0 opacity-60"
                        strokeWidth={2.5}
                      />
                      {displayMeta.grade?.trim() ? (
                        <>
                          <span className="max-w-[min(100%,16rem)] leading-snug">
                            {displayMeta.grade}
                          </span>
                          <ChevronRight
                            className="h-3 w-3 shrink-0 opacity-60"
                            strokeWidth={2.5}
                          />
                        </>
                      ) : null}
                      <span className="max-w-[min(100%,18rem)] leading-snug">
                        {displayMeta.category}
                      </span>
                    </nav>

                    <div className="space-y-2">
                      <h1
                        className={`text-balance text-2xl font-black leading-[1.12] tracking-tight sm:text-3xl lg:text-[2rem] lg:leading-tight ${currentTheme.text}`}
                      >
                        {displayMeta.title}
                      </h1>
                      <p
                        className={`text-base font-semibold sm:text-lg ${currentTheme.text}`}
                      >
                        {displayMeta.author}
                      </p>
                      {pubLineParts.length > 0 ? (
                        <p className={`text-sm ${currentTheme.muted}`}>
                          {pubLineParts.join(" · ")}
                        </p>
                      ) : null}
                    </div>

                    {bookError && (
                      <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 lg:text-left">
                        {t("reader.sampleBanner")}
                      </p>
                    )}

                    {heroMetaItems.length > 0 && (
                      <dl
                        className={`grid grid-cols-1 gap-3 rounded-2xl border p-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-3 ${detailSurface}`}
                      >
                        {heroMetaItems.map(({ icon: Icon, label, value }) => (
                          <div
                            key={label}
                            className="flex gap-3 text-left sm:min-w-0"
                          >
                            <span
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${themeMode === "light" ? "bg-white text-[#18AD5B] shadow-sm ring-1 ring-slate-200/80" : "bg-[#faf6ed] text-[#18AD5B] ring-1 ring-[#d4c4a8]/60"}`}
                            >
                              <Icon className="h-4 w-4" strokeWidth={2} />
                            </span>
                            <div className="min-w-0 flex-1">
                              <dt
                                className={`text-[10px] font-bold uppercase tracking-wide ${currentTheme.muted}`}
                              >
                                {label}
                              </dt>
                              <dd
                                className={`mt-0.5 text-sm font-medium leading-snug ${currentTheme.text}`}
                              >
                                {value}
                              </dd>
                            </div>
                          </div>
                        ))}
                      </dl>
                    )}

                    {displayMeta.description && (
                      <div
                        className={`rounded-2xl border px-4 py-3 text-left ${detailSurface}`}
                      >
                        <p
                          className={`text-[10px] font-bold uppercase tracking-wide ${currentTheme.muted}`}
                        >
                          {t("reader.intro")}
                        </p>
                        <p
                          className={`mt-2 line-clamp-4 text-sm leading-relaxed ${currentTheme.muted}`}
                        >
                          {displayMeta.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          </div>

          
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`sticky top-0 z-20 w-full ${currentTheme.bg}/90 backdrop-blur-md border-b ${currentTheme.border} px-6 py-3`}
          >
            <div
              className={`mx-auto flex max-w-5xl items-center gap-4 ${showPdfViewer ? "justify-end" : "justify-between"}`}
            >
              {!showPdfViewer && (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setFontSize(Math.max(50, fontSize - 10))}
                    className={currentTheme.muted}
                  >
                    <Minus className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                  <span className="w-14 px-3 text-center text-xs font-bold text-slate-500">
                    {fontSize}%
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setFontSize(Math.min(150, fontSize + 10))}
                    className={currentTheme.muted}
                  >
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2 sm:gap-4">
                <div
                  className={`flex items-center gap-1 rounded-2xl p-1 ${themeMode === "sepia" ? "bg-[#ebe4d4]" : "bg-slate-100"}`}
                >
                  <button
                    type="button"
                    onClick={() => setThemeMode("light")}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      themeMode === "light"
                        ? "bg-white text-slate-900 shadow-sm"
                        : `${currentTheme.muted} hover:opacity-90`
                    }`}
                  >
                    {t("reader.light")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeMode("sepia")}
                    className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      themeMode === "sepia"
                        ? "bg-[#faf6ed] text-[#5b4636] shadow-sm"
                        : `${currentTheme.muted} hover:opacity-90`
                    }`}
                  >
                    {t("reader.cream")}
                  </button>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className={currentTheme.muted}
                >
                  <Settings className="w-5 h-5" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </motion.div>

          
          <div className="flex-1 w-full max-w-5xl mx-auto p-6 md:p-10 lg:p-12">
            {ebookLoading && (
              <div
                className={`mb-6 flex items-center justify-center gap-2 rounded-2xl border ${currentTheme.border} ${currentTheme.content} py-8 text-sm ${currentTheme.muted}`}
              >
                {t("reader.checkingEbook")}
              </div>
            )}

            {ebookError && !ebookLoading && (
              <div
                className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
              >
                {t("reader.ebookFail")}
              </div>
            )}

            {showPdfViewer && ebook?.filePath && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5, ease: premiumEasing }}
                className={`mb-10 rounded-[2rem] border p-2 shadow-2xl md:p-4 ${currentTheme.border} ${
                  themeMode === "sepia" ? "bg-[#e8dfc8]" : "bg-slate-100"
                }`}
              >
                <EbookReader
                  sourceUrl={ebook.filePath}
                  className={`border-0 shadow-none ${
                    themeMode === "sepia" ? "bg-[#faf6ed]" : "bg-white"
                  }`}
                />
              </motion.div>
            )}

            {!ebookLoading &&
              !showPdfViewer &&
              ebook &&
              !ebookError &&
              !ebook.filePath && (
                <div
                  className={`mb-6 rounded-2xl border ${currentTheme.border} ${currentTheme.content} px-4 py-6 text-center text-sm ${currentTheme.muted}`}
                >
                  {t("reader.noEbookFile")}
                </div>
              )}

            {!ebookLoading &&
              !showPdfViewer &&
              ebook?.filePath &&
              !isPdfEbook(ebook.filePath, ebook.fileFormat) && (
                <div
                  className={`mb-6 rounded-2xl border ${currentTheme.border} ${currentTheme.content} px-4 py-6 text-center text-sm ${currentTheme.muted}`}
                >
                  {t("reader.unsupportedFormat")}
                </div>
              )}

            {!showPdfViewer && (
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: premiumEasing }}
              className={`${currentTheme.content} shadow-2xl rounded-[2rem] p-8 md:p-12 lg:p-16 min-h-[1000px] border ${currentTheme.border}`}
              style={{ fontSize: `${fontSize}%` }}
            >
              {readerMockChapters.map((chapter) => (
                <div key={chapter.id}>
                  <h2 className="text-3xl font-bold mb-10 text-[#18AD5B]">
                    {chapter.title}
                  </h2>
                  {chapter.content.map((block) => {
                    if (block.type === "paragraph") {
                      return (
                        <p key={block.id} className="text-lg leading-9 mb-8">
                          {block.text}
                        </p>
                      );
                    }
                    if (block.type === "quote") {
                      return (
                        <div
                          key={block.id}
                          className={`my-12 rounded-2xl border-l-4 border-l-[#18AD5B] p-8 ${
                            themeMode === "sepia"
                              ? "bg-[#f0e8d8]"
                              : "bg-slate-50"
                          }`}
                        >
                          <p className="italic leading-relaxed text-lg">
                            {block.text}
                          </p>
                          <p className={`mt-4 text-sm ${currentTheme.muted}`}>
                            {block.author}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </motion.article>
            )}

            {!showPdfViewer && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-between mt-10 mb-12"
            >
              <Button
                variant="ghost"
                className={`flex items-center gap-2 ${currentTheme.muted} hover:text-[#18AD5B] px-6 py-3 rounded-2xl`}
              >
                <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                <span className="font-medium">{t("reader.prevChapter")}</span>
              </Button>
              <span className="text-sm font-medium text-slate-500">
                {t("reader.pageProgress")}
              </span>
              <Button
                variant="ghost"
                className={`flex items-center gap-2 ${currentTheme.muted} hover:text-[#18AD5B] px-6 py-3 rounded-2xl`}
              >
                <span className="font-medium">{t("reader.nextChapter")}</span>
                <ArrowRight className="w-4 h-4" strokeWidth={2} />
              </Button>
            </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
