import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation, Trans } from "react-i18next";
import {
  Wallet,
  AlertTriangle,
  CheckCircle,
  Info,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { FinePaymentChoiceDialog } from "@/components/fine-payment-choice-dialog";
import { useFine } from "@/hooks/useFine";
import type { Fine } from "@/types/fine.type";
import { readerDateLocale } from "@/lib/reader-locale";
import { formatFineTableDate, getFineBorrowRow } from "@/lib/fine-display";

function ReasonBadge({ reason }: { reason: Fine["reason"] }) {
  const { t } = useTranslation("pages");
  const normalizedReason = reason as "overdue" | "damaged" | "lost";
  const config = {
    overdue: {
      bg: "bg-amber-50 text-amber-600",
      labelKey: "historyFines.reasonOverdue" as const,
    },
    damaged: {
      bg: "bg-red-50 text-red-600",
      labelKey: "historyFines.reasonDamaged" as const,
    },
    lost: {
      bg: "bg-slate-100 text-slate-500",
      labelKey: "historyFines.reasonLost" as const,
    },
  };

  const { bg, labelKey } =
    config[normalizedReason] ?? {
      bg: "bg-slate-100 text-slate-500",
      labelKey: undefined,
    };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${bg}`}
    >
      {labelKey ? t(labelKey) : reason}
    </span>
  );
}

function StatusBadge({ status }: { status: Fine["status"] }) {
  const { t } = useTranslation("pages");
  const normalizedStatus = status as "unpaid" | "pending" | "paid" | "cancelled";
  const config = {
    unpaid: {
      text: "text-red-500",
      dot: "bg-red-500",
      labelKey: "historyFines.stUnpaid" as const,
    },
    pending: {
      text: "text-sky-600",
      dot: "bg-sky-500",
      labelKey: "historyFines.stPending" as const,
    },
    paid: {
      text: "text-[#18AD5B]",
      dot: "bg-[#18AD5B]",
      labelKey: "historyFines.stPaid" as const,
    },
    cancelled: {
      text: "text-slate-500",
      dot: "bg-slate-400",
      labelKey: undefined as undefined,
    },
  };

  const { text, dot, labelKey } =
    config[normalizedStatus] ?? {
      text: "text-slate-400",
      dot: "bg-slate-400",
      labelKey: undefined,
    };

  return (
    <div className={`flex items-center gap-1.5 font-bold text-xs ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {labelKey ? t(labelKey) : normalizedStatus === "cancelled" ? t("historyFines.stCancelled") : status}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(readerDateLocale(), {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

type FineTab = "unpaid" | "pending" | "paid";

function tabFromSearch(tabParam: string | null): FineTab {
  if (tabParam === "pending" || tabParam === "paid") return tabParam;
  return "unpaid";
}

function fineRowClass(status: Fine["status"]): string {
  if (status === "paid") {
    return "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0";
  }
  if (status === "pending") {
    return "bg-sky-50/40";
  }
  return "";
}

export function HistoryFinesPage() {
  const { t } = useTranslation("pages");
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = useMemo(
    () => tabFromSearch(searchParams.get("tab")),
    [searchParams],
  );

  const selectTab = (tab: FineTab) => {
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (tab === "unpaid") p.delete("tab");
        else p.set("tab", tab);
        return p;
      },
      { replace: true },
    );
  };

  const { fines } = useFine();

  const finesData = fines?.data ?? [];

  const totalUnpaid = finesData
    .filter((item) => item.status === "unpaid" || item.status === "pending")
    .reduce((sum, item) => sum + item.fineAmount, 0);

  const unpaidCount = finesData.filter((item) => item.status === "unpaid").length;
  const pendingCount = finesData.filter((item) => item.status === "pending").length;
  const paidCount = finesData.filter((item) => item.status === "paid").length;

  const filteredItems = finesData.filter((item) => {
    if (activeTab === "unpaid") return item.status === "unpaid";
    if (activeTab === "pending") return item.status === "pending";
    return item.status === "paid";
  });

  let listStateLabel = t("historyFines.statePaid");
  if (activeTab === "unpaid") listStateLabel = t("historyFines.stateUnpaid");
  else if (activeTab === "pending") listStateLabel = t("historyFines.statePending");

  return (
    <div className="flex flex-col gap-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="flex flex-col gap-2"
      >
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">
          {t("historyFines.title")}
        </h1>
        <p className="text-slate-500 font-medium">{t("historyFines.subtitle")}</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5"
      >
        <div className="md:col-span-2 bg-gradient-to-br from-[#18AD5B] to-[#46C37B] p-8 rounded-[2.5rem] shadow-xl shadow-[#18AD5B]/20 relative overflow-hidden flex items-center justify-between text-white">
          <div className="relative z-10">
            <span className="text-[10px] font-bold uppercase tracking-[0.15em] opacity-80">
              {t("historyFines.totalUnpaid")}
            </span>
            <div className="text-5xl font-black mt-3 mb-6">
              {formatCurrency(totalUnpaid)}
            </div>
            <Button
              className="px-8 py-3.5 bg-white text-[#18AD5B] font-bold rounded-2xl shadow-md hover:bg-emerald-50 transition-all active:scale-[0.98] flex items-center gap-2"
              disabled
              title={t("historyFines.payAllSoon")}
            >
              <Wallet className="w-5 h-5" strokeWidth={2} />
              <span>{t("historyFines.payAll")}</span>
            </Button>
          </div>
          <div className="hidden sm:block opacity-15 transform rotate-12">
            <Wallet
              className="w-[140px] h-[140px]"
              strokeWidth={1}
              fill="currentColor"
            />
          </div>
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          ></div>
        </div>

        <div className="bg-white p-6 flex flex-col justify-center border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
              <AlertTriangle className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("historyFines.tabUnpaidTitle")}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {t("historyFines.tabUnpaidCount", { count: unpaidCount })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-600">
              <Clock className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("historyFines.tabPendingTitle")}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {t("historyFines.tabPendingCount", { count: pendingCount })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
              <CheckCircle className="w-6 h-6" strokeWidth={2} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {t("historyFines.tabPaidTitle")}
              </div>
              <div className="text-2xl font-black text-slate-900">
                {t("historyFines.tabPaidCount", { count: paidCount })}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100"
      >
        <div className="flex flex-wrap items-center gap-x-1 gap-y-2 border-b border-slate-100 px-8 pt-6">
          <button
            type="button"
            onClick={() => selectTab("unpaid")}
            className={`pb-5 px-4 sm:px-6 border-b-2 transition-all duration-300 ${
              activeTab === "unpaid"
                ? "border-[#18AD5B] text-[#18AD5B] font-bold text-sm"
                : "border-transparent text-slate-400 font-medium text-sm hover:text-slate-600"
            }`}
          >
            {t("historyFines.tabUnpaid")}
            <span className="ml-2 bg-[#18AD5B]/10 text-[#18AD5B] px-2 py-0.5 rounded-full text-xs font-bold">
              {unpaidCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectTab("pending")}
            className={`pb-5 px-4 sm:px-6 border-b-2 transition-all duration-300 ${
              activeTab === "pending"
                ? "border-sky-600 text-sky-700 font-bold text-sm"
                : "border-transparent text-slate-400 font-medium text-sm hover:text-slate-600"
            }`}
          >
            {t("historyFines.tabPending")}
            <span className="ml-2 bg-sky-500/10 text-sky-700 px-2 py-0.5 rounded-full text-xs font-bold">
              {pendingCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => selectTab("paid")}
            className={`pb-5 px-4 sm:px-6 border-b-2 transition-all duration-300 ${
              activeTab === "paid"
                ? "border-[#18AD5B] text-[#18AD5B] font-bold text-sm"
                : "border-transparent text-slate-400 font-medium text-sm hover:text-slate-600"
            }`}
          >
            {t("historyFines.tabPaid")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("historyFines.colBook")}
                </th>
                <th className="px-5 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("historyFines.colDate")}
                </th>
                <th className="px-5 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("historyFines.colReason")}
                </th>
                <th className="px-5 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("historyFines.colAmount")}
                </th>
                <th className="px-5 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                  {t("historyFines.colStatus")}
                </th>
                <th className="px-8 py-5 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 text-right">
                  {t("historyFines.colAction")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredItems.map((item, index) => {
                const borrowRow = getFineBorrowRow(item);
                const borrowDateLabel = formatFineTableDate(borrowRow.borrowDate);
                return (
                  <motion.tr
                    key={item.id ?? `${item.borrowId}-${item.fineDate}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`hover:bg-slate-50/80 transition-colors ${fineRowClass(item.status)}`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-16 bg-slate-200 rounded-xl overflow-hidden shrink-0 shadow-sm flex items-center justify-center">
                          <span className="text-xs text-slate-400">
                            {t("historyFines.bookLabel")}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 leading-tight">
                            {borrowRow.bookTitle || t("historyFines.defaultBookTitle")}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {t("historyFines.borrowedPrefix")}{" "}
                            {borrowDateLabel || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-6 text-sm text-slate-600 font-medium">
                      {formatFineTableDate(item.fineDate)}
                    </td>
                    <td className="px-5 py-6">
                      <ReasonBadge reason={item.reason} />
                    </td>
                    <td className="px-5 py-6 text-sm font-black text-slate-900">
                      {formatCurrency(item.fineAmount)}
                    </td>
                    <td className="px-5 py-6">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-8 py-6 text-right">
                      {item.status === "unpaid" || item.status === "pending" ? (
                        <FinePaymentChoiceDialog
                          fine={item}
                          size="sm"
                          triggerClassName={
                            item.status === "pending"
                              ? "bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl"
                              : "bg-[#18AD5B] hover:bg-[#46C37B] text-xs font-bold rounded-xl"
                          }
                        />
                      ) : (
                        <span className="text-xs font-bold text-slate-400 italic">
                          {t("historyFines.done")}
                        </span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
          <div>
            {t("historyFines.showing", {
              count: filteredItems.length,
              state: listStateLabel,
            })}
          </div>
          <div className="flex items-center gap-4">
            <button className="hover:text-[#18AD5B] transition-colors flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
              <span>{t("historyFines.prevPage")}</span>
            </button>
            <button className="text-[#18AD5B]">1</button>
            <button className="hover:text-[#18AD5B] transition-colors flex items-center gap-1">
              <span>{t("historyFines.nextPage")}</span>
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-2 p-6 rounded-2xl flex items-start gap-5 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100"
      >
        <div className="w-12 h-12 bg-[#18AD5B]/10 rounded-2xl flex items-center justify-center text-[#18AD5B] shrink-0">
          <Info className="w-6 h-6" strokeWidth={2} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 mb-2">
            {t("historyFines.policyTitle")}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            <Trans
              ns="pages"
              i18nKey="historyFines.policyBody"
              components={{ strong: <strong className="text-[#18AD5B]" /> }}
            />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
