import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBorrowRecord } from "@/hooks/useBorrowRecord";
import { useBookAuthor, useAuthor } from "@/hooks/useBookAuthor";
import { useBookGradeLevel } from "@/hooks/useBookGradeLevel";
import { useGradeLevel } from "@/hooks/useGradeLevel";
import { AUTH_KEYS } from "@/constants/auth";
import type {
  BorrowRecord,
  BorrowRecordBook,
  GetBorrowRecordsParams,
} from "@/types/borrow-record.type";
import { formatPhysicalCopyReferencePrice } from "@/lib/physical-copy-reference-price";
import {
  BOOK_ROW_COVER_FRAME_CLASS,
  BOOK_ROW_COVER_IMG_INNER_CLASS,
  BOOK_ROW_COVER_PLACEHOLDER_CLASS,
} from "@/components/book-row-cover";
import { cn } from "@/lib/utils";
import { readerDateLocale } from "@/lib/reader-locale";
import type { TFunction } from "i18next";
import { RenewBorrowPayOsDialog } from "@/components/renew-borrow-payos-dialog";

function resolveBook(record: BorrowRecord): BorrowRecordBook | undefined {
  return record.book ?? record.copy?.book;
}

function bookIdFromRecord(record: BorrowRecord): string | undefined {
  return resolveBook(record)?.id ?? record.bookId ?? record.copy?.bookId;
}

function getBookCoverUrl(record: BorrowRecord): string {
  return resolveBook(record)?.coverImage?.trim() || "";
}

function getBookTitle(record: BorrowRecord, t: TFunction<"pages">): string {
  return (
    resolveBook(record)?.title ||
    record.bookTitle ||
    t("borrowRecords.noTitle")
  );
}

function formatCopyCondition(
  raw: string | undefined,
  t: TFunction<"pages">,
): string {
  if (!raw) return t("borrowRecords.notUpdated");
  const key = raw.toLowerCase();
  return t(`borrowRecords.copyCondition.${key}`, { defaultValue: raw });
}

function getCopyBarcode(record: BorrowRecord, t: TFunction<"pages">): string {
  return record.copy?.barcode?.trim() || t("borrowRecords.noBarcode");
}

function getBookIsbn(record: BorrowRecord, t: TFunction<"pages">): string {
  return resolveBook(record)?.isbn?.trim() || t("borrowRecords.noIsbn");
}

function getBookCategory(record: BorrowRecord, t: TFunction<"pages">): string {
  return resolveBook(record)?.mainCategory?.name || t("borrowRecords.uncategorized");
}

function getBookLocation(record: BorrowRecord, t: TFunction<"pages">): string {
  const location = record.copy?.location;
  if (!location) return t("borrowRecords.noLocation");
  const parts = [
    location.name,
    location.section
      ? t("borrowRecords.locSection", { section: location.section })
      : "",
    location.shelf
      ? t("borrowRecords.locShelf", { shelf: location.shelf })
      : "",
    location.floor !== undefined
      ? t("borrowRecords.locFloor", { floor: location.floor })
      : "",
  ].filter(Boolean);
  return parts.join(" - ");
}

function BorrowRecordCoverThumb({
  record,
  className,
  t,
}: {
  record: BorrowRecord;
  className?: string;
  t: TFunction<"pages">;
}) {
  const url = getBookCoverUrl(record);
  const title = getBookTitle(record, t);
  if (url) {
    return (
      <div className={cn(BOOK_ROW_COVER_FRAME_CLASS, className)}>
        <img
          src={url}
          alt={title}
          className={BOOK_ROW_COVER_IMG_INNER_CLASS}
          loading="lazy"
        />
      </div>
    );
  }
  return (
    <div className={cn(BOOK_ROW_COVER_PLACEHOLDER_CLASS, className)}>
      <BookOpen className="h-5 w-5 opacity-60" />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("pages");
  const config = {
    overdue: {
      bg: "bg-red-50 text-red-600",
      border: "border-red-100",
      dot: "bg-red-500",
      labelKey: "borrowRecords.status.overdue" as const,
    },
    borrowed: {
      bg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      dot: "bg-blue-500",
      labelKey: "borrowRecords.status.borrowed" as const,
    },
    renewed: {
      bg: "bg-purple-50 text-purple-600",
      border: "border-purple-100",
      dot: "bg-purple-500",
      labelKey: "borrowRecords.status.renewed" as const,
    },
    returned: {
      bg: "bg-green-50 text-green-600",
      border: "border-green-100",
      dot: "bg-green-500",
      labelKey: "borrowRecords.status.returned" as const,
    },
  };

  const statusKey = status as keyof typeof config;
  const { bg, border, dot, labelKey } = config[statusKey] || config.borrowed;

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${bg} border ${border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} mr-2`}></span>
      {t(labelKey)}
    </span>
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(readerDateLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateTime(dateString: string | undefined): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString(readerDateLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function BorrowRecordDetailDialog({
  record,
  open,
  onOpenChange,
  authorsLine,
  gradesLine,
}: {
  record: BorrowRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorsLine: string;
  gradesLine: string;
}) {
  const { t } = useTranslation("pages");

  if (!record) return null;

  const book = resolveBook(record);
  const coverUrl = getBookCoverUrl(record);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 pr-8">
            <FileText className="w-5 h-5 text-[#18AD5B]" />
            {t("borrowRecords.dialogTitle")}
          </DialogTitle>
          <DialogDescription>{t("borrowRecords.dialogDesc")}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5">
          <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border">
            {coverUrl ? (
              <div className={BOOK_ROW_COVER_FRAME_CLASS}>
                <img
                  src={coverUrl}
                  alt={getBookTitle(record, t)}
                  className={BOOK_ROW_COVER_IMG_INNER_CLASS}
                  loading="lazy"
                />
              </div>
            ) : (
              <div className={BOOK_ROW_COVER_PLACEHOLDER_CLASS}>
                <Bookmark className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="min-w-0 flex-1 space-y-1.5">
              <h3 className="text-base font-bold text-foreground">
                {getBookTitle(record, t)}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.fIsbn")}{" "}
                {getBookIsbn(record, t)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.barcodeLine")} {getCopyBarcode(record, t)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.refPrice")}{" "}
                {formatPhysicalCopyReferencePrice(record.copy)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.copyCond")}{" "}
                {formatCopyCondition(record.copy?.currentCondition, t)}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.category")} {getBookCategory(record, t)}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {t("borrowRecords.authors")} {authorsLine}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("borrowRecords.grades")} {gradesLine}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {t("borrowRecords.location")} {getBookLocation(record, t)}
              </p>
              <div className="pt-2">
                <StatusBadge status={record.status} />
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
              {t("borrowRecords.slipId")}
            </p>
            <p className="text-sm font-mono font-semibold text-foreground break-all">
              {record.id}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("borrowRecords.borrowDate")}
              </p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                {formatDate(record.borrowDate)}
              </p>
            </div>
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("borrowRecords.dueDate")}
              </p>
              <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                {formatDate(record.dueDate)}
              </p>
            </div>
            {record.returnDate ? (
              <div className="rounded-lg border border-border p-4 bg-card sm:col-span-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  {t("borrowRecords.returnDate")}
                </p>
                <p className="text-sm font-semibold text-green-600 flex items-center gap-2">
                  <Calendar className="w-4 h-4 shrink-0" />
                  {formatDate(record.returnDate)}
                </p>
              </div>
            ) : null}
          </div>

          {(record.librarian?.fullName || record.librarian?.username) && (
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("borrowRecords.librarian")}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {record.librarian.fullName || record.librarian.username}
              </p>
            </div>
          )}

          {record.reader?.fullName && (
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("borrowRecords.reader")}
              </p>
              <p className="text-sm font-semibold text-foreground">
                {record.reader.fullName}
              </p>
            </div>
          )}

          <div className="rounded-lg border border-border p-4 bg-card space-y-2">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              {t("borrowRecords.fullInfo")}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
              <p className="text-muted-foreground">
                {t("borrowRecords.fTitle")}{" "}
                <span className="text-foreground font-medium">
                  {book?.title || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fIsbn")}{" "}
                <span className="text-foreground font-medium">
                  {book?.isbn || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fYear")}{" "}
                <span className="text-foreground font-medium">
                  {book?.publishYear ?? "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fEdition")}{" "}
                <span className="text-foreground font-medium">
                  {book?.edition || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fLang")}{" "}
                <span className="text-foreground font-medium">
                  {book?.language || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fPages")}{" "}
                <span className="text-foreground font-medium">
                  {book?.pageCount ?? "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fBookType")}{" "}
                <span className="text-foreground font-medium">
                  {book?.bookType || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fPhysical")}{" "}
                <span className="text-foreground font-medium">
                  {book?.physicalType || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fPublisher")}{" "}
                <span className="text-foreground font-medium">
                  {book?.publisher?.publisherName || "-"}
                </span>
              </p>
              <p className="text-muted-foreground">
                {t("borrowRecords.fMainCat")}{" "}
                <span className="text-foreground font-medium">
                  {book?.mainCategory?.name || "-"}
                </span>
              </p>
              <p className="text-muted-foreground sm:col-span-2">
                {t("borrowRecords.fDesc")}{" "}
                <span className="text-foreground font-medium">
                  {book?.description || "-"}
                </span>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border p-4 bg-card flex items-center justify-between gap-4">
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
              {t("borrowRecords.copyDbId")}
            </span>
            <span className="text-xs font-mono text-foreground break-all text-right">
              {record.copyId}
            </span>
          </div>

          {record.createdAt && (
            <div className="rounded-lg border border-border p-4 bg-card">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                {t("borrowRecords.createdAt")}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(record.createdAt)}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("borrowRecords.close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BorrowRecordsPage() {
  const { t } = useTranslation("pages");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(
    null,
  );
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewTargetRecord, setRenewTargetRecord] = useState<BorrowRecord | null>(
    null,
  );

  const readerStr = localStorage.getItem(AUTH_KEYS.READER);
  const reader = readerStr ? JSON.parse(readerStr) : null;
  const readerId = reader?.id;

  const params: GetBorrowRecordsParams = {
    page,
    limit,
    readerId,
  };

  const { borrowRecords, borrowRecordsLoading } = useBorrowRecord(params);
  const { bookAuthors } = useBookAuthor({ limit: 500 });
  const { authors } = useAuthor({ limit: 300 });
  const { bookGradeLevels } = useBookGradeLevel({ limit: 500 });
  const { gradeLevels } = useGradeLevel({ limit: 100 });

  const authorNameByBookId = useMemo(() => {
    const map = new Map<string, string>();
    const relations = bookAuthors?.data || [];
    const authorList = authors?.data || [];
    const authorMap = new Map<string, string>();
    authorList.forEach((author) => {
      if (author.id) authorMap.set(author.id, author.authorName);
    });
    const grouped = new Map<string, string[]>();
    relations.forEach((relation) => {
      const name = authorMap.get(relation.authorId);
      if (!name) return;
      const existing = grouped.get(relation.bookId) || [];
      existing.push(name);
      grouped.set(relation.bookId, existing);
    });
    grouped.forEach((names, bookId) => {
      map.set(bookId, Array.from(new Set(names)).join(", "));
    });
    return map;
  }, [bookAuthors?.data, authors?.data]);

  const gradeNameByBookId = useMemo(() => {
    const map = new Map<string, string>();
    const relations = bookGradeLevels?.data || [];
    const grades = gradeLevels?.data || [];
    const gradeMap = new Map<string, string>();
    grades.forEach((grade) => {
      if (grade.id) gradeMap.set(grade.id, grade.name);
    });
    const grouped = new Map<string, string[]>();
    relations.forEach((relation) => {
      const name = gradeMap.get(relation.gradeLevelId);
      if (!name) return;
      const existing = grouped.get(relation.bookId) || [];
      existing.push(name);
      grouped.set(relation.bookId, existing);
    });
    grouped.forEach((names, bookId) => {
      map.set(bookId, Array.from(new Set(names)).join(", "));
    });
    return map;
  }, [bookGradeLevels?.data, gradeLevels?.data]);

  const detailBookId = selectedRecord
    ? bookIdFromRecord(selectedRecord)
    : undefined;
  const detailAuthorsLine =
    detailBookId && authorNameByBookId.get(detailBookId)
      ? authorNameByBookId.get(detailBookId)!
      : t("borrowRecords.notUpdatedMeta");
  const detailGradesLine =
    detailBookId && gradeNameByBookId.get(detailBookId)
      ? gradeNameByBookId.get(detailBookId)!
      : t("borrowRecords.notUpdatedMeta");

  const data = borrowRecords?.data || [];
  const meta = borrowRecords?.meta;
  const totalPages = meta?.totalPages || 1;

  const handleViewDetail = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setDetailDialogOpen(true);
  };

  const openRenewDialog = (record: BorrowRecord) => {
    setRenewTargetRecord(record);
    setRenewDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {t("borrowRecords.pageTitle")}
        </h1>
        <p className="text-slate-500">{t("borrowRecords.pageSubtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("borrowRecords.thBook")}
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("borrowRecords.thBorrow")}
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("borrowRecords.thDue")}
              </th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("borrowRecords.thStatus")}
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("borrowRecords.thActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {borrowRecordsLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#18AD5B]" />
                    <p className="text-slate-500 text-sm">
                      {t("borrowRecords.loading")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <p className="text-slate-400 text-sm">{t("borrowRecords.empty")}</p>
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <BorrowRecordCoverThumb record={record} t={t} />
                      <div>
                        <p className="font-bold text-slate-900">
                          {getBookTitle(record, t)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {t("borrowRecords.code", { id: record.copyId })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">
                    {formatDate(record.borrowDate)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">
                    {formatDate(record.dueDate)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={record.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                        onClick={() => handleViewDetail(record)}
                      >
                        {t("borrowRecords.detail")}
                      </Button>
                      {(record.status === "borrowed" ||
                        record.status === "renewed") && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#18AD5B]/30 text-[#18AD5B] font-bold rounded-xl hover:bg-[#18AD5B]/5"
                          onClick={() => openRenewDialog(record)}
                          disabled={!!record.isRenewed}
                        >
                          {record.isRenewed
                            ? t("borrowRecords.renewed")
                            : t("borrowRecords.renew")}
                        </Button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-4">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              {t("borrowRecords.pageOf", { page, totalPages })}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <BorrowRecordDetailDialog
        record={selectedRecord}
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        authorsLine={detailAuthorsLine}
        gradesLine={detailGradesLine}
      />

      <RenewBorrowPayOsDialog
        open={renewDialogOpen}
        onOpenChange={(open) => {
          setRenewDialogOpen(open);
          if (!open) setRenewTargetRecord(null);
        }}
        borrowRecordId={renewTargetRecord?.id ?? null}
        bookTitle={
          renewTargetRecord
            ? getBookTitle(renewTargetRecord, t)
            : undefined
        }
      />
    </div>
  );
}

export default BorrowRecordsPage;
