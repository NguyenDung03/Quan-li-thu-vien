import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  BookOpen,
  Bookmark,
  Settings,
  Grid3X3,
  CircleDot,
  User,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBorrowRecord, useReturnBook } from "@/hooks/useBorrowRecord";
import { useReservation } from "@/hooks/useReservation";
import type { BorrowRecord } from "@/types/borrow-record.type";
import { toast } from "sonner";
import { readerDateLocale } from "@/lib/reader-locale";
import { RenewBorrowPayOsDialog } from "@/components/renew-borrow-payos-dialog";

function StatusBadge({ status }: { status: string }) {
  const { t } = useTranslation("pages");
  const config = {
    overdue: {
      bg: "bg-red-50 text-red-600",
      border: "border-red-100",
      dot: "bg-red-500",
      labelKey: "statusBorrow.overdue" as const,
    },
    borrowed: {
      bg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      dot: "bg-blue-500",
      labelKey: "statusBorrow.borrowed" as const,
    },
    renewed: {
      bg: "bg-blue-50 text-blue-600",
      border: "border-blue-100",
      dot: "bg-blue-500",
      labelKey: "statusBorrow.renewed" as const,
    },
    returned: {
      bg: "bg-green-50 text-green-600",
      border: "border-green-100",
      dot: "bg-green-500",
      labelKey: "statusBorrow.returned" as const,
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

function BookIcon({ type }: { type: string }) {
  const iconMap: Record<string, React.ReactNode> = {
    book: <BookOpen className="w-5 h-5" strokeWidth={2} />,
    code: <Grid3X3 className="w-5 h-5" strokeWidth={2} />,
    function: <CircleDot className="w-5 h-5" strokeWidth={2} />,
    brain: <User className="w-5 h-5" strokeWidth={2} />,
    terminal: <Settings className="w-5 h-5" strokeWidth={2} />,
    globe: <BookOpen className="w-5 h-5" strokeWidth={2} />,
  };

  return iconMap[type] || <BookOpen className="w-5 h-5" strokeWidth={2} />;
}

function formatDate(dateString: string): string {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString(readerDateLocale(), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function borrowRecordCoverUrl(record: BorrowRecord): string {
  const fromBook = record.book?.coverImage?.trim();
  const fromCopyBook = record.copy?.book?.coverImage?.trim();
  return fromBook || fromCopyBook || "";
}

function borrowRecordTitle(
  record: BorrowRecord,
  noTitle: string,
): string {
  return (
    record.book?.title ||
    record.copy?.book?.title ||
    record.bookTitle ||
    noTitle
  );
}

export function HistoryPage() {
  const { t } = useTranslation("pages");
  const [activeTab, setActiveTab] = useState<"borrowing" | "returned">(
    "borrowing",
  );
  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [renewTargetRecord, setRenewTargetRecord] = useState<BorrowRecord | null>(
    null,
  );

  const { borrowRecords, borrowRecordsLoading, refetchBorrowRecords } =
    useBorrowRecord();

  const { returnBookAsync } = useReturnBook();

  const filteredRecords =
    borrowRecords?.data?.filter((record) =>
      activeTab === "borrowing"
        ? record.status !== "returned"
        : record.status === "returned",
    ) || [];

  const openRenewDialog = (record: BorrowRecord) => {
    setRenewTargetRecord(record);
    setRenewDialogOpen(true);
  };

  const handleReturn = async (recordId: string) => {
    try {
      await returnBookAsync({ id: recordId, librarianId: "system" });
      toast.success(t("historyBorrow.returnOk"));
      refetchBorrowRecords();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("historyBorrow.returnFail"));
    }
  };

  const { reservations, reservationsLoading } = useReservation();
  const pendingReservations =
    reservations?.data?.filter((r) => r.status === "pending") || [];

  const handleBorrowAgain = (bookId: string) => {
    console.log("Borrow again:", bookId);
  };

  const handleBorrowFromSaved = (bookId: string) => {
    console.log("Borrow saved book:", bookId);
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
          {t("historyBorrow.title")}
        </h1>
        <p className="text-slate-500">{t("historyBorrow.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex border-b border-slate-100"
      >
        <button
          onClick={() => setActiveTab("borrowing")}
          className={`px-8 py-4 border-b-2 transition-all duration-300 ${
            activeTab === "borrowing"
              ? "border-[#18AD5B] text-[#18AD5B] font-bold text-sm"
              : "border-transparent text-slate-400 hover:text-slate-600 font-medium text-sm"
          }`}
        >
          {t("historyBorrow.tabBorrowing")}
        </button>
        <button
          onClick={() => setActiveTab("returned")}
          className={`px-8 py-4 border-b-2 transition-all duration-300 ${
            activeTab === "returned"
              ? "border-[#18AD5B] text-[#18AD5B] font-bold text-sm"
              : "border-transparent text-slate-400 hover:text-slate-600 font-medium text-sm"
          }`}
        >
          {t("historyBorrow.tabReturned")}
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden overflow-x-auto border border-slate-100"
      >
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("historyBorrow.colBook")}
              </th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("historyBorrow.colBorrow")}
              </th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("historyBorrow.colDue")}
              </th>
              <th className="px-6 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                {t("historyBorrow.colStatus")}
              </th>
              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] text-right">
                {t("historyBorrow.colActions")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {borrowRecordsLoading ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-[#18AD5B]" />
                    <p className="text-slate-500 text-sm">
                      {t("historyBorrow.loading")}
                    </p>
                  </div>
                </td>
              </tr>
            ) : filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-12 text-center">
                  <p className="text-slate-400 text-sm">
                    {activeTab === "borrowing"
                      ? t("historyBorrow.emptyBorrowing")
                      : t("historyBorrow.emptyReturned")}
                  </p>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record, index) => {
                const coverUrl = borrowRecordCoverUrl(record);
                const title = borrowRecordTitle(record, t("historyBorrow.noTitle"));
                return (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {coverUrl ? (
                          <img
                            src={coverUrl}
                            alt={title}
                            className="w-12 h-16 rounded-xl object-cover shrink-0 border border-slate-100 bg-white"
                          />
                        ) : (
                          <div className="w-12 h-16 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 text-slate-400">
                            <BookIcon type="book" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{title}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {t("historyBorrow.copyCode", { id: record.copyId })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-sm text-slate-600 font-medium">
                      {formatDate(record.borrowDate)}
                    </td>
                    <td className="px-6 py-6 text-sm text-slate-900 font-bold">
                      {formatDate(record.dueDate)}
                    </td>
                    <td className="px-6 py-6">
                      <StatusBadge status={record.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      {record.status === "overdue" && (
                        <Button
                          size="sm"
                          className="bg-[#18AD5B] hover:bg-[#46C37B] text-white font-bold rounded-xl"
                          onClick={() => handleReturn(record.id!)}
                        >
                          {t("historyBorrow.returnNow")}
                        </Button>
                      )}
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
                            ? t("historyBorrow.renewed")
                            : t("historyBorrow.renewBorrow")}
                        </Button>
                      )}
                      {record.status === "returned" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-100 text-slate-500 font-bold rounded-xl hover:bg-slate-50"
                          onClick={() => handleBorrowAgain(record.bookId!)}
                        >
                          {t("historyBorrow.borrowAgain")}
                        </Button>
                      )}
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-4"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-[#18AD5B]" strokeWidth={2} />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              {t("historyBorrow.savedTitle")}
            </h2>
          </div>
          <a
            className="text-[#18AD5B] text-sm font-bold hover:underline"
            href="#"
          >
            {t("historyBorrow.viewAll")}
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {reservationsLoading ? (
            <div className="col-span-full py-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-[#18AD5B] mx-auto" />
              <p className="text-slate-500 text-sm mt-3">
                {t("historyBorrow.savedLoading")}
              </p>
            </div>
          ) : pendingReservations.length > 0 ? (
            pendingReservations.map((reservation, index) => (
              <motion.div
                key={reservation.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              >
                <Card className="p-5 flex items-start gap-4 border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem]">
                  <div className="w-16 h-20 bg-[#18AD5B]/10 rounded-xl flex items-center justify-center shrink-0 border border-[#18AD5B]/20">
                    <BookIcon type="book" />
                  </div>
                  <CardContent className="flex-1 p-0">
                    <h3 className="font-bold text-slate-900 leading-tight text-sm">
                      {(reservation as { bookTitle?: string }).bookTitle ||
                        t("historyBorrow.noTitle")}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5">
                      {t("historyBorrow.reservedOn", {
                        date: formatDate(reservation.reservationDate),
                      })}
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-4 w-full border-[#18AD5B]/30 text-[#18AD5B] font-bold rounded-xl hover:bg-[#18AD5B]/5 text-xs"
                      onClick={() => handleBorrowFromSaved(reservation.bookId)}
                    >
                      {t("historyBorrow.borrowNow")}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center">
              <p className="text-slate-400 text-sm">{t("historyBorrow.noSaved")}</p>
            </div>
          )}
        </div>
      </motion.div>

      <RenewBorrowPayOsDialog
        open={renewDialogOpen}
        onOpenChange={(open) => {
          setRenewDialogOpen(open);
          if (!open) setRenewTargetRecord(null);
        }}
        borrowRecordId={renewTargetRecord?.id ?? null}
        bookTitle={
          renewTargetRecord
            ? borrowRecordTitle(renewTargetRecord, t("historyBorrow.noTitle"))
            : undefined
        }
      />
    </div>
  );
}
