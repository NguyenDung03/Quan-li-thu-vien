import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { fineApi } from "@/apis/fine.api";
import {
  computeDamagedBookFineAmount,
  DAMAGED_BOOK_FINE_FIXED_FALLBACK_VND,
  computeLostBookFineAmount,
  isPhysicalConditionWorseThanAtBorrow,
  LOST_BOOK_PROCESSING_FEE_FALLBACK_VND,
  physicalCopyFineReferenceAmount,
} from "@/lib/damaged-book-fine.util";
import { useAuth } from "@/hooks/use-auth";
import { Breadcrumb } from "@/components/breadcrumb";
import { PageHeader } from "@/components/page-header";
import { DeleteDialog } from "@/components/delete-dialog";
import {
  useBorrowRecords,
  useCreateBorrowRecord,
  useUpdateBorrowRecord,
  useDeleteBorrowRecord,
  useRenewBorrowOffline,
} from "@/hooks/use-borrow-records";
import { useQueryParameters } from "@/hooks/use-query-parameters";
import type {
  BorrowRecord,
  BorrowRecordStatusType,
  BorrowRecordFormSubmitPayload,
  CreateBorrowRecordRequest,
} from "@/types/borrow-record.types";
import { BorrowRecordsTable } from "./components/borrow-records-table";
import { BorrowRecordsStatsCards } from "./components/borrow-records-stats-cards";
import { BorrowRecordForm } from "./components/borrow-record-form";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type BorrowStatusTab = "all" | BorrowRecordStatusType;

export function BorrowRecordsPage() {
  const { t } = useTranslation("borrowRecord");
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  
  const { params, setParam, setMultipleParams } = useQueryParameters({
    page: 1,
    limit: 10,
    search: "",
    status: "all" as BorrowStatusTab,
  });

  const activeStatusTab: BorrowStatusTab =
    params.status === "borrowed" ||
    params.status === "returned" ||
    params.status === "overdue" ||
    params.status === "renewed" ||
    params.status === "lost"
      ? params.status
      : "all";

  

  const [editingRecord, setEditingRecord] = useState<BorrowRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<BorrowRecord | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState(params.search);
  const [initialFormData, setInitialFormData] = useState<
    | (Partial<CreateBorrowRecordRequest> & {
        readerName?: string;
        bookTitle?: string;
      })
    | undefined
  >(() => {
    if (location.state?.action === "create" && location.state.readerId) {
      return {
        readerId: location.state.readerId,
        copyId: location.state.copyId || "",
        readerName: location.state.readerName,
        bookTitle: location.state.bookTitle,
      };
    }
    return undefined;
  });

  const [isSheetOpen, setIsSheetOpen] = useState(() => {
    if (location.state?.action === "create") {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (location.state?.action === "create") {
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  
  const { data, isLoading } = useBorrowRecords({
    page: params.page,
    limit: params.limit,
    search: params.search || undefined,
    status: activeStatusTab === "all" ? undefined : activeStatusTab,
  });
  const createMutation = useCreateBorrowRecord();
  const updateMutation = useUpdateBorrowRecord();
  const deleteMutation = useDeleteBorrowRecord();
  const renewOfflineMutation = useRenewBorrowOffline();

  const debouncedSearch = searchInput.trim();
  const urlSearch = String(params.search ?? "").trim();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearch !== urlSearch) {
        setMultipleParams({ search: debouncedSearch, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedSearch, urlSearch, setMultipleParams]);

  
  const handleOpenSheet = (record?: BorrowRecord) => {
    if (record) {
      setEditingRecord(record);
    } else {
      setEditingRecord(null);
      setInitialFormData(undefined);
    }
    setIsSheetOpen(true);
  };

  const handleSubmit = async (formData: BorrowRecordFormSubmitPayload) => {
    const toApiErrorMessage = (error: unknown): string => {
      const fallback = "Có lỗi xảy ra khi lưu phiếu mượn";
      const axiosErr = error as AxiosError<{ message?: string | string[] }>;
      const raw = axiosErr?.response?.data?.message;
      if (Array.isArray(raw)) {
        return raw[0] || fallback;
      }
      if (typeof raw === "string" && raw.trim()) {
        return raw;
      }
      return fallback;
    };

    const renewalOfflineFineAmount = formData.renewalOfflineFineAmount;
    const restFormData = { ...formData };
    delete restFormData.readerName;
    delete restFormData.bookTitle;
    delete restFormData.renewalOfflineFineAmount;

    
    const dataWithLibrarian = {
      ...restFormData,
      librarianId: user?.id || "",
    };

    try {
      if (editingRecord) {
        const wantsOfflineRenew =
          !editingRecord.isRenewed &&
          String(restFormData.status).toLowerCase() === "renewed";

        if (wantsOfflineRenew) {
          if (
            renewalOfflineFineAmount === undefined ||
            !Number.isFinite(renewalOfflineFineAmount) ||
            renewalOfflineFineAmount < 0
          ) {
            toast.error(t("renewalFeeInvalid"));
            throw new Error("INVALID_RENEWAL_FEE");
          }
          await renewOfflineMutation.mutateAsync({
            id: editingRecord.id,
            body: { fineAmount: renewalOfflineFineAmount },
          });
          toast.success(t("renewOfflineSuccess"));
          setIsSheetOpen(false);
          setEditingRecord(null);
          return;
        }

        await updateMutation.mutateAsync({
          id: editingRecord.id,
          data: dataWithLibrarian,
        });

        const isReturned =
          String(dataWithLibrarian.status).toLowerCase() === "returned";
        const currentCopyStatus = String(
          editingRecord.copy?.status ?? "",
        ).toLowerCase();
        const received = editingRecord.copy?.currentCondition;
        const atBorrow = editingRecord.conditionAtBorrow ?? "good";
        const fineDate = dataWithLibrarian.returnDate
          ? new Date(dataWithLibrarian.returnDate).toISOString()
          : new Date().toISOString();

        if (isReturned && currentCopyStatus === "lost") {
          try {
            const rules = await fineApi.getFineRules();
            const ref = physicalCopyFineReferenceAmount(editingRecord.copy);
            const fineAmount = computeLostBookFineAmount(rules, ref);

            toast.success(t("redirectLostFineToast"));
            navigate("/dashboard/violations", {
              state: {
                openCreateDamagedFine: true,
                initialFineDraft: {
                  borrowId: editingRecord.id,
                  fineAmount,
                  fineDate,
                  reason: "Mất sách (xử lý thủ công từ phiếu mượn)",
                  status: "unpaid",
                },
              },
            });
            setIsSheetOpen(false);
            setEditingRecord(null);
            return;
          } catch {
            toast.error(t("redirectLostFineRulesError"));
            navigate("/dashboard/violations", {
              state: {
                openCreateDamagedFine: true,
                initialFineDraft: {
                  borrowId: editingRecord.id,
                  fineAmount: LOST_BOOK_PROCESSING_FEE_FALLBACK_VND,
                  fineDate,
                  reason: "Mất sách (xử lý thủ công từ phiếu mượn)",
                  status: "unpaid",
                },
              },
            });
            setIsSheetOpen(false);
            setEditingRecord(null);
            return;
          }
        }

        if (
          isReturned &&
          received &&
          isPhysicalConditionWorseThanAtBorrow(received, atBorrow)
        ) {
          try {
            const rules = await fineApi.getFineRules();
            const ref = physicalCopyFineReferenceAmount(editingRecord.copy);
            const fineAmount = computeDamagedBookFineAmount(rules, ref);

            toast.success(t("redirectDamagedFineToast"));
            navigate("/dashboard/violations", {
              state: {
                openCreateDamagedFine: true,
                initialFineDraft: {
                  borrowId: editingRecord.id,
                  fineAmount,
                  fineDate,
                  reason: `Làm hỏng / xuống cấp so với lúc mượn (${atBorrow} → ${received})`,
                  status: "unpaid",
                },
              },
            });
            setIsSheetOpen(false);
            setEditingRecord(null);
            return;
          } catch {
            toast.error(t("redirectDamagedFineRulesError"));
            navigate("/dashboard/violations", {
              state: {
                openCreateDamagedFine: true,
                initialFineDraft: {
                  borrowId: editingRecord.id,
                  fineAmount: DAMAGED_BOOK_FINE_FIXED_FALLBACK_VND,
                  fineDate,
                  reason: `Làm hỏng / xuống cấp so với lúc mượn (${atBorrow} → ${received})`,
                  status: "unpaid",
                },
              },
            });
            setIsSheetOpen(false);
            setEditingRecord(null);
          }
        }
      } else {
        await createMutation.mutateAsync(dataWithLibrarian);
      }
    } catch (error) {
      toast.error(toApiErrorMessage(error));
      throw error;
    }
  };

  const handleDelete = async () => {
    if (deletingRecord) {
      await deleteMutation.mutateAsync(deletingRecord.id);
      setDeletingRecord(null);
    }
  };

  const handleSearchSubmit = () => {
    setMultipleParams({ search: searchInput.trim(), page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setParam("page", newPage);
  };

  const handleStatusTabChange = (value: string) => {
    const next: BorrowStatusTab =
      value === "borrowed" ||
      value === "returned" ||
      value === "overdue" ||
      value === "renewed" ||
      value === "lost"
        ? value
        : "all";
    setMultipleParams({ status: next, page: 1 });
  };

  const isSubmitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    renewOfflineMutation.isPending;

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: t("title", { ns: "common" }), href: "/dashboard" },
          { label: t("title") },
        ]}
      />

      <PageHeader
        title={t("title")}
        description={t("description")}
        searchPlaceholder={t("search")}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchSubmit={handleSearchSubmit}
        showAddButton={false}
      />

      <BorrowRecordsStatsCards />

      <Tabs
        value={activeStatusTab}
        onValueChange={handleStatusTabChange}
        className="space-y-4"
      >
        <TabsList className="w-fit max-w-full justify-start overflow-x-auto">
          <TabsTrigger value="all">{t("statusAll")}</TabsTrigger>
          <TabsTrigger value="borrowed">{t("statusBorrowed")}</TabsTrigger>
          <TabsTrigger value="overdue">{t("statusOverdue")}</TabsTrigger>
          <TabsTrigger value="renewed">{t("statusRenewed")}</TabsTrigger>
          <TabsTrigger value="lost">{t("statusLost")}</TabsTrigger>
          <TabsTrigger value="returned">{t("statusReturned")}</TabsTrigger>
        </TabsList>
      </Tabs>

      <BorrowRecordsTable
        data={data?.data || []}
        meta={data?.meta}
        loading={isLoading}
        noDataText={t("noData")}
        currentPage={params.page}
        limit={params.limit}
        onPageChange={handlePageChange}
        onEdit={handleOpenSheet}
        onDelete={(record) => setDeletingRecord(record)}
      />

      <BorrowRecordForm
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        record={editingRecord}
        initialData={initialFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onBorrowRecordCopyUpdated={(updates) => {
          setEditingRecord((prev) => {
            if (!prev?.copy) return prev;
            return {
              ...prev,
              copy: {
                ...prev.copy,
                currentCondition: updates.currentCondition,
                status: updates.status,
              },
            };
          });
        }}
      />

      <DeleteDialog
        open={!!deletingRecord}
        onOpenChange={() => setDeletingRecord(null)}
        title={t("deleteConfirmTitle")}
        description={t("deleteConfirmDescription", {
          name: deletingRecord?.reader?.fullName || "",
        })}
        onConfirm={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}

