import { useTranslation } from "react-i18next";
import { DataTable, type Column } from "@/components/data-table";
import { ActionButtons } from "@/components/action-buttons";
import type { Fine, FineStatus } from "@/types/fine.types";

interface FinesTableProps {
  data: Fine[];
  meta?: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  loading?: boolean;
  noDataText?: string;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  onEdit: (item: Fine) => void;
  onDelete: (item: Fine) => void;
}

export function FinesTable({
  data,
  meta,
  loading = false,
  noDataText = "Không có dữ liệu",
  currentPage,
  limit,
  onPageChange,
  onEdit,
  onDelete,
}: FinesTableProps) {
  const { t } = useTranslation("common");

  const formatCurrency = (amount: number | string) => {
    const n = typeof amount === "string" ? Number(amount) : amount;
    if (!Number.isFinite(n)) return "—";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(n);
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const getStatusBadge = (status: FineStatus) => {
    const isPaid = status === "paid";
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          isPaid
            ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {isPaid ? t("fines.paid") : t("fines.unpaid")}
      </span>
    );
  };

  const columns: Column<Fine>[] = [
    {
      key: "reader",
      header: t("fines.reader"),
      render: (item: Fine) => {
        const reader = item.borrow?.reader || item.reader;
        return (
          <div>
            <div className="font-medium">{reader?.fullName || "-"}</div>
            <div className="text-xs text-slate-500">
              {reader?.cardNumber || "-"}
            </div>
          </div>
        );
      },
    },
    {
      key: "fineAmount",
      header: t("fines.fineAmount"),
      render: (item: Fine) => (
        <span className="font-medium text-red-600">
          {formatCurrency(item.fineAmount)}
        </span>
      ),
    },
    {
      key: "reason",
      header: t("fines.reason"),
      render: (item: Fine) => item.reason,
    },
    {
      key: "fineDate",
      header: t("fines.fineDate"),
      render: (item: Fine) => formatDate(item.fineDate),
    },
    {
      key: "status",
      header: t("fines.status"),
      render: (item: Fine) => getStatusBadge(item.status),
    },
    {
      key: "actions",
      header: t("common.actions"),
      render: (item: Fine) => (
        <ActionButtons
          onEdit={() => onEdit(item)}
          onDelete={() => onDelete(item)}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      meta={meta}
      loading={loading}
      noDataText={noDataText}
      currentPage={currentPage}
      limit={limit}
      onPageChange={onPageChange}
    />
  );
}
