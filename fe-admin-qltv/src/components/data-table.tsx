import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";


const getPageNumbers = (
  currentPage: number,
  totalPages: number,
): (number | string)[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const delta = 2;
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  let prev = 0;
  for (const i of range) {
    if (i - prev > 1) {
      rangeWithDots.push("...");
    }
    rangeWithDots.push(i);
    prev = i;
  }

  return rangeWithDots;
};

export interface PaginationMeta {
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  meta?: PaginationMeta;
  loading?: boolean;
  noDataText?: string;
  currentPage: number;
  limit: number;
  onPageChange: (page: number) => void;
  showSerialNumber?: boolean;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  meta,
  loading = false,
  noDataText = "Không có dữ liệu",
  currentPage,
  limit,
  onPageChange,
  showSerialNumber = true,
}: DataTableProps<T>) {
  const { t } = useTranslation("common");

  
  const actionsColumnIndex = columns.findIndex((col) => col.key === "actions");

  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-900/50">
              {showSerialNumber && (
                <TableHead className="font-semibold w-12 text-center whitespace-nowrap">
                  STT
                </TableHead>
              )}
              {columns.map((col, idx) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "font-semibold whitespace-nowrap",
                    col.className || "",
                    
                    idx === actionsColumnIndex && actionsColumnIndex !== -1
                      ? "text-right w-[100px]"
                      : "",
                  )}
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={(showSerialNumber ? 1 : 0) + columns.length}
                  className="text-center py-12"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-300 border-t-primary rounded-full animate-spin" />
                    <span className="text-slate-500">
                      {t("common.loading")}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={(showSerialNumber ? 1 : 0) + columns.length}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <span className="text-lg">{noDataText}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                >
                  {showSerialNumber && (
                    <TableCell className="font-medium text-center text-slate-500 whitespace-nowrap">
                      {(currentPage - 1) * limit + index + 1}
                    </TableCell>
                  )}
                  {columns.map((col, idx) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        col.className,
                        "whitespace-nowrap",
                        
                        idx === actionsColumnIndex && actionsColumnIndex !== -1
                          ? "text-right"
                          : "",
                      )}
                    >
                      {col.render
                        ? col.render(item, index)
                        : ((item as Record<string, unknown>)[
                            col.key
                          ] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      
      {meta && meta.totalPages > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="hidden sm:inline">
              {t("showing")} {(currentPage - 1) * limit + 1} -{" "}
              {Math.min(currentPage * limit, meta.totalItems)} {t("of")}{" "}
              {meta.totalItems}
            </span>
            <span className="sm:hidden">
              {currentPage}/{meta.totalPages}
            </span>
          </p>

          <nav
            className="flex items-center gap-1"
            aria-label={t("common.paginationNavLabel")}
          >
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-8 h-8 cursor-pointer"
              disabled={!meta.hasPreviousPage}
              onClick={() => onPageChange(currentPage - 1)}
              aria-label={t("common.paginationPrev")}
            >
              <ChevronLeft className="w-4 h-4" aria-hidden />
            </Button>

            <div className="hidden sm:flex items-center gap-1">
              {getPageNumbers(currentPage, meta.totalPages).map(
                (pageNum, idx) =>
                  typeof pageNum === "number" ? (
                    <Button
                      type="button"
                      key={idx}
                      variant={pageNum === currentPage ? "default" : "ghost"}
                      size="icon"
                      className={cn(
                        "w-8 h-8 cursor-pointer",
                        pageNum === currentPage &&
                          "bg-primary text-primary-foreground hover:bg-primary/90",
                      )}
                      onClick={() => onPageChange(pageNum)}
                      aria-label={t("common.paginationGoToPage", {
                        page: pageNum,
                      })}
                      aria-current={pageNum === currentPage ? "page" : undefined}
                    >
                      <span aria-hidden>{pageNum}</span>
                    </Button>
                  ) : (
                    <span
                      key={idx}
                      className="px-1 text-slate-500 dark:text-slate-400"
                      aria-hidden
                    >
                      {pageNum}
                    </span>
                  ),
              )}
            </div>

            <span className="sm:hidden text-sm text-slate-500 px-2">
              {currentPage} / {meta.totalPages}
            </span>

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-8 h-8 cursor-pointer"
              disabled={!meta.hasNextPage}
              onClick={() => onPageChange(currentPage + 1)}
              aria-label={t("common.paginationNext")}
            >
              <ChevronRight className="w-4 h-4" aria-hidden />
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
}
