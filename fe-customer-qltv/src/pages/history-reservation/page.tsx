import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Eye, Zap, Clock, Timer, Loader2, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReservation } from "@/hooks/useReservation";
import { useBookAuthor, useAuthor } from "@/hooks/useBookAuthor";
import { useBookGradeLevel } from "@/hooks/useBookGradeLevel";
import { useGradeLevel } from "@/hooks/useGradeLevel";
import { AUTH_KEYS } from "@/constants/auth";
import type { Reservation } from "@/types/reservation.type";
import { formatPhysicalCopyReferencePrice } from "@/lib/physical-copy-reference-price";
import {
  BOOK_ROW_COVER_FRAME_CLASS,
  BOOK_ROW_COVER_IMG_INNER_CLASS,
  BOOK_ROW_COVER_PLACEHOLDER_CLASS,
} from "@/components/book-row-cover";
import { readerDateLocale } from "@/lib/reader-locale";

type ReservationTab = "all" | "pending" | "fulfilled" | "cancelled" | "expired";

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(readerDateLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getTimeRemaining(
  expiryDate: string,
  t: (key: string, opts?: Record<string, unknown>) => string,
): {
  timeLeft: string;
  progress: number;
  isUrgent: boolean;
} {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) {
    return { timeLeft: t("reservation.timeExpired"), progress: 0, isUrgent: false };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  const timeLeft =
    days > 0
      ? t("reservation.timeDaysHours", { days, hours })
      : t("reservation.timeHoursOnly", { hours });
  const totalDays = 7;
  const progress = Math.max(
    0,
    Math.min(100, ((totalDays - days) / totalDays) * 100),
  );

  return { timeLeft, progress, isUrgent: days < 2 };
}

function StatusBadge({
  status,
  t,
}: Readonly<{
  status: string;
  t: (key: string) => string;
}>) {
  const variantByStatus: Record<
    string,
    "ready" | "pending" | "expired" | "fulfilled" | "cancelled"
  > = {
    pending: "pending",
    fulfilled: "ready",
    cancelled: "cancelled",
    expired: "expired",
  };

  const variant = variantByStatus[status] ?? "pending";

  const labelKey =
    status === "pending"
      ? "reservation.statusPending"
      : status === "fulfilled"
        ? "reservation.statusFulfilled"
        : status === "cancelled"
          ? "reservation.statusCancelled"
          : status === "expired"
            ? "reservation.statusExpired"
            : status;

  const styles = {
    ready: "bg-green-50 text-green-600 border-green-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    expired: "bg-slate-100 text-slate-500 border-slate-100",
    fulfilled: "bg-green-50 text-green-600 border-green-100",
    cancelled: "bg-slate-100 text-slate-500 border-slate-100",
  };

  const label =
    status === "pending" ||
    status === "fulfilled" ||
    status === "cancelled" ||
    status === "expired"
      ? t(labelKey as "reservation.statusPending")
      : status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border ${styles[variant]}`}
    >
      {(variant === "ready" || variant === "fulfilled") && (
        <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse" />
      )}
      {label}
    </span>
  );
}

export default function BookReservationPage() {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReservationTab>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);

  const tabs: { key: ReservationTab; labelKey: string }[] = [
    { key: "all", labelKey: "reservation.tabAll" },
    { key: "pending", labelKey: "reservation.tabPending" },
    { key: "fulfilled", labelKey: "reservation.tabFulfilled" },
    { key: "cancelled", labelKey: "reservation.tabCancelled" },
    { key: "expired", labelKey: "reservation.tabExpired" },
  ];

  const getParams = () => {
    const readerStr = localStorage.getItem(AUTH_KEYS.READER);
    const reader = readerStr ? JSON.parse(readerStr) : null;
    const readerId = reader?.id;

    const params: Record<string, string | number | undefined> = {
      page: currentPage,
      limit: 10,
    };
    if (activeTab !== "all") params.status = activeTab;
    if (readerId) params.readerId = readerId;
    return params;
  };

  const { reservations, reservationsLoading } = useReservation(getParams());
  const { bookAuthors } = useBookAuthor({ limit: 500 });
  const { authors } = useAuthor({ limit: 300 });
  const { bookGradeLevels } = useBookGradeLevel({ limit: 500 });
  const { gradeLevels } = useGradeLevel({ limit: 100 });

  const handleOpenDetail = (reservation: Reservation) => {
    setSelectedReservation(reservation);
  };

  const getBookTitle = (item: Reservation) =>
    item.book?.title || item.bookTitle || t("reservation.noTitle");
  const getBookCover = (item: Reservation) => item.book?.coverImage || "";
  const getBookIsbn = (item: Reservation) =>
    item.book?.isbn || t("reservation.noIsbn");
  const getCopyBarcode = (item: Reservation) =>
    item.copy?.barcode || t("reservation.noBarcode");
  const getCopyCondition = (item: Reservation) =>
    item.copy?.currentCondition || t("reservation.notUpdated");
  const getBookCategory = (item: Reservation) =>
    item.book?.mainCategory?.name || t("reservation.uncategorized");
  const getBookLocation = (item: Reservation) => {
    const location = item.copy?.location;
    if (!location) return t("reservation.noLocation");
    const parts = [
      location.name,
      location.section
        ? t("reservation.locSection", { section: location.section })
        : "",
      location.shelf
        ? t("reservation.locShelf", { shelf: location.shelf })
        : "",
      location.floor !== undefined
        ? t("reservation.locFloor", { floor: location.floor })
        : "",
    ].filter(Boolean);
    return parts.join(" - ");
  };

  const tabStatusLabel = (tab: Exclude<ReservationTab, "all">) => {
    const map: Record<Exclude<ReservationTab, "all">, string> = {
      pending: t("reservation.statusPending"),
      fulfilled: t("reservation.statusFulfilled"),
      cancelled: t("reservation.statusCancelled"),
      expired: t("reservation.statusExpired"),
    };
    return map[tab];
  };

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

  const getBookAuthors = (item: Reservation) =>
    (item.bookId && authorNameByBookId.get(item.bookId)) ||
    t("reservation.notUpdatedMeta");
  const getBookGrades = (item: Reservation) =>
    (item.bookId && gradeNameByBookId.get(item.bookId)) ||
    t("reservation.notUpdatedMeta");

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {t("reservation.title")}
        </h1>
        <p className="text-slate-500">{t("reservation.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex border-b border-border overflow-x-auto"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
            className={`px-6 py-4 border-b-2 transition-all duration-300 whitespace-nowrap text-sm font-medium ${
              activeTab === tab.key
                ? "border-primary text-primary font-bold"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`}
          >
            {t(tab.labelKey as "reservation.tabAll")}
            {tab.key === "all" && reservations?.data && (
              <span className="ml-2 px-2 py-0.5 bg-primary/10 rounded-md text-xs">
                {reservations.data.length}
              </span>
            )}
          </button>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="box-border w-28 min-w-28 max-w-28 shrink-0 px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {t("reservation.thCover")}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("reservation.thBook")}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("reservation.thReserved")}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("reservation.thStatus")}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {t("reservation.thExpires")}
                </th>
                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">
                  {t("reservation.thActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reservationsLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-muted-foreground text-sm">
                        {t("reservation.loading")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : !reservations?.data || reservations.data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                      {activeTab === "all"
                        ? t("reservation.emptyAll")
                        : t("reservation.emptyTab", {
                            status: tabStatusLabel(activeTab),
                          })}
                    </p>
                  </td>
                </tr>
              ) : (
                reservations.data.map((item, index) => {
                  const timeInfo = item.expiryDate
                    ? getTimeRemaining(item.expiryDate, t)
                    : null;

                  return (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`hover:bg-muted/30 transition-colors group ${
                        item.status === "expired" || item.status === "cancelled"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      <td className="box-border w-28 min-w-28 max-w-28 shrink-0 px-6 py-4 align-middle">
                        {getBookCover(item) ? (
                          <div className={BOOK_ROW_COVER_FRAME_CLASS}>
                            <img
                              src={getBookCover(item)}
                              alt={getBookTitle(item)}
                              className={BOOK_ROW_COVER_IMG_INNER_CLASS}
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className={BOOK_ROW_COVER_PLACEHOLDER_CLASS}>
                            <Bookmark className="h-4 w-4 opacity-60" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="max-w-md">
                          <h3 className="text-sm font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                            {getBookTitle(item)}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            <span className="font-medium text-foreground/80">
                              {t("reservation.locationPrefix")}{" "}
                            </span>
                            {getBookLocation(item)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-medium text-muted-foreground">
                          {formatDate(item.reservationDate)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} t={t} />
                      </td>
                      <td className="px-6 py-4">
                        {timeInfo &&
                        (item.status === "pending" ||
                          item.status === "fulfilled") ? (
                          <div className="flex flex-col gap-1.5 w-36">
                            <div
                              className={`flex items-center gap-1.5 text-xs font-bold ${
                                timeInfo.isUrgent
                                  ? "text-destructive"
                                  : "text-primary"
                              }`}
                            >
                              {timeInfo.isUrgent ? (
                                <Zap size={14} />
                              ) : item.status === "pending" ? (
                                <Clock size={14} />
                              ) : (
                                <Timer size={14} />
                              )}
                              {timeInfo.timeLeft}
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${timeInfo.progress}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${
                                  timeInfo.isUrgent
                                    ? "bg-destructive"
                                    : "bg-primary"
                                }`}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-muted-foreground italic">
                            {item.status === "cancelled"
                              ? t("reservation.cancelled")
                              : item.status === "expired"
                                ? t("reservation.lapsed")
                                : "-"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenDetail(item)}
                          className="p-2 text-muted-foreground hover:text-primary transition-colors hover:bg-primary/5 rounded-lg"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {reservations?.meta && (
          <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {t("reservation.showing", {
                shown: reservations.data?.length || 0,
                total: reservations.meta.totalItems,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={!reservations.meta.hasPreviousPage}
                className="h-8"
              >
                {t("reservation.prev")}
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: reservations.meta.totalPages },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-md text-xs font-bold transition-colors ${
                      currentPage === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!reservations.meta.hasNextPage}
                className="h-8"
              >
                {t("reservation.next")}
              </Button>
            </div>
          </div>
        )}
      </motion.div>

      <Dialog
        open={!!selectedReservation}
        onOpenChange={(open) => {
          if (!open) setSelectedReservation(null);
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-xl max-h-[85vh] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <DialogHeader>
            <DialogTitle>{t("reservation.dialogTitle")}</DialogTitle>
            <DialogDescription>{t("reservation.dialogDesc")}</DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="grid gap-5">
              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg border border-border">
                {getBookCover(selectedReservation) ? (
                  <div className={BOOK_ROW_COVER_FRAME_CLASS}>
                    <img
                      src={getBookCover(selectedReservation)}
                      alt={getBookTitle(selectedReservation)}
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
                    {getBookTitle(selectedReservation)}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    ISBN: {getBookIsbn(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("reservation.barcode")} {getCopyBarcode(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("reservation.refPrice")}{" "}
                    {formatPhysicalCopyReferencePrice(selectedReservation.copy)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("reservation.copyCond")} {getCopyCondition(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("reservation.category")} {getBookCategory(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {t("reservation.authors")} {getBookAuthors(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("reservation.grades")} {getBookGrades(selectedReservation)}
                  </p>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {t("reservation.location")}{" "}
                    {getBookLocation(selectedReservation)}
                  </p>
                  <div className="pt-2">
                    <StatusBadge status={selectedReservation.status} t={t} />
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 bg-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                  {t("reservation.reservationCode")}
                </p>
                <p className="text-sm font-mono font-semibold text-foreground break-all">
                  {selectedReservation.id}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-4 bg-card">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    {t("reservation.placedAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(selectedReservation.reservationDate)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4 bg-card">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-1">
                    {t("reservation.expiresAt")}
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {formatDate(selectedReservation.expiryDate)}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4 bg-card space-y-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-bold">
                  {t("reservation.fullBookInfo")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <p className="text-muted-foreground">
                    {t("reservation.labelTitle")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.title || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    ISBN:{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.isbn || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelYear")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.publishYear ?? "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelEdition")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.edition || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelLang")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.language || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelPages")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.pageCount ?? "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelBookType")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.bookType || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelPhysical")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.physicalType || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelPublisher")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.publisher?.publisherName ||
                        "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {t("reservation.labelMainCat")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.mainCategory?.name || "-"}
                    </span>
                  </p>
                  <p className="text-muted-foreground sm:col-span-2">
                    {t("reservation.labelDesc")}{" "}
                    <span className="text-foreground font-medium">
                      {selectedReservation.book?.description || "-"}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-2 flex-wrap">
                <DialogClose
                  render={<Button type="button" variant="outline" />}
                >
                  {t("reservation.close")}
                </DialogClose>
                <Button
                  type="button"
                  onClick={() => {
                    if (selectedReservation.bookId) {
                      setSelectedReservation(null);
                      navigate(`/book/${selectedReservation.bookId}`);
                    }
                  }}
                >
                  {t("reservation.openDetail")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
