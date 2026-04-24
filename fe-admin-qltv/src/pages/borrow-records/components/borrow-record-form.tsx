import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useReader } from "@/hooks/use-readers";
import { useFineRules } from "@/hooks/use-fines";
import { useUpdatePhysicalCopy } from "@/hooks/use-physical-copies";
import type {
  PhysicalCopyCondition,
  PhysicalCopyStatus,
} from "@/types/physical-copy.types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type {
  BorrowRecord,
  BorrowRecordFormSubmitPayload,
  CreateBorrowRecordRequest,
} from "@/types/borrow-record.types";

function addCalendarDaysToIso(isoStart: string, days: number): string {
  const d = new Date(isoStart);
  if (Number.isNaN(d.getTime())) return isoStart;
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function formatDateTimeDisplay(
  iso: string | undefined,
  language: string | undefined,
): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const locale = language?.startsWith("vi") ? "vi-VN" : "en-US";
  return d.toLocaleString(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const PHYSICAL_COPY_CONDITIONS: PhysicalCopyCondition[] = [
  "new",
  "good",
  "worn",
  "damaged",
];


const PHYSICAL_COPY_STATUSES: PhysicalCopyStatus[] = [
  "available",
  "borrowed",
  "reserved",
  "damaged",
  "lost",
  "maintenance",
];

const BORROW_FORM_PHYSICAL_COPY_STATUSES = PHYSICAL_COPY_STATUSES.filter(
  (s) => s !== "damaged",
);

function normalizePhysicalCondition(
  value: string | undefined,
): PhysicalCopyCondition {
  const v = (value ?? "").toLowerCase();
  return PHYSICAL_COPY_CONDITIONS.includes(v as PhysicalCopyCondition)
    ? (v as PhysicalCopyCondition)
    : "good";
}

function normalizePhysicalStatus(value: string | undefined): PhysicalCopyStatus {
  const v = (value ?? "").toLowerCase();
  return PHYSICAL_COPY_STATUSES.includes(v as PhysicalCopyStatus)
    ? (v as PhysicalCopyStatus)
    : "available";
}


function physicalCopyFineReferenceAmount(
  copy:
    | {
        price?: number | null;
        purchasePrice?: number | null;
      }
    | undefined,
): number | null {
  if (!copy) return null;
  if (copy.price != null) {
    const n = Number(copy.price);
    if (Number.isFinite(n) && n > 0) return n;
  }
  if (copy.purchasePrice != null) {
    const n = Number(copy.purchasePrice);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
}

interface BorrowRecordFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: BorrowRecord | null;
  initialData?: Partial<CreateBorrowRecordRequest> & {
    readerName?: string;
    bookTitle?: string;
  };
  isSubmitting?: boolean;
  onSubmit: (data: BorrowRecordFormSubmitPayload) => Promise<void>;
  onBorrowRecordCopyUpdated?: (updates: {
    currentCondition: string;
    status: string;
  }) => void;
}

const initialFormData: CreateBorrowRecordRequest = {
  readerId: "",
  copyId: "",
  borrowDate: new Date().toISOString(),
  dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  returnDate: undefined,
  status: "borrowed",
};

export function BorrowRecordForm({
  open,
  onOpenChange,
  record,
  initialData,
  isSubmitting = false,
  onSubmit,
  onBorrowRecordCopyUpdated,
}: BorrowRecordFormProps) {
  const { t, i18n } = useTranslation("borrowRecord");
  const { t: tPc } = useTranslation("physicalCopyEnums");
  const updatePhysicalCopyMutation = useUpdatePhysicalCopy();
  const { data: fineRules } = useFineRules();
  const [formData, setFormData] =
    useState<CreateBorrowRecordRequest>(initialFormData);
  const [renewalOfflineFineAmountStr, setRenewalOfflineFineAmountStr] =
    useState("");

  const effectiveReaderId = record?.readerId ?? formData.readerId;
  const { data: readerFetched } = useReader(effectiveReaderId, {
    enabled: open && !!effectiveReaderId,
  });

  const policyBorrowDays = useMemo(
    () =>
      record?.reader?.readerType?.borrowDurationDays ??
      readerFetched?.readerType?.borrowDurationDays ??
      14,
    [
      record?.reader?.readerType?.borrowDurationDays,
      readerFetched?.readerType?.borrowDurationDays,
    ],
  );

  useEffect(() => {
    if (!open) return;
    if (record) {
      setFormData({
        readerId: record.readerId,
        copyId: record.copyId,
        borrowDate: record.borrowDate,
        dueDate: record.dueDate,
        returnDate: record.returnDate || undefined,
        status: record.status,
      });
    } else {
      setFormData({
        ...initialFormData,
        ...initialData,
      } as CreateBorrowRecordRequest);
    }
  }, [open, record, initialData]);

  useEffect(() => {
    if (!open || record || !formData.borrowDate) return;
    const due = addCalendarDaysToIso(formData.borrowDate, policyBorrowDays);
    setFormData((prev) =>
      prev.dueDate === due ? prev : { ...prev, dueDate: due },
    );
  }, [open, record, formData.borrowDate, policyBorrowDays]);

  const showRenewalOfflineFee =
    !!record && !record.isRenewed && formData.status === "renewed";

  useEffect(() => {
    if (!record || record.isRenewed) return;
    if (formData.status !== "renewed") {
      setRenewalOfflineFineAmountStr("");
    }
  }, [record?.id, record?.isRenewed, formData.status]);

  useEffect(() => {
    if (!open) {
      setRenewalOfflineFineAmountStr("");
      return;
    }
    if (!showRenewalOfflineFee) return;
    const def = fineRules?.renewalFeeAmount;
    if (def == null) return;
    setRenewalOfflineFineAmountStr((prev) =>
      prev === "" ? String(def) : prev,
    );
  }, [open, showRenewalOfflineFee, fineRules?.renewalFeeAmount]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let renewalOfflineFineAmount: number | undefined;
    if (showRenewalOfflineFee) {
      const raw = renewalOfflineFineAmountStr.replaceAll(/\s/g, "");
      const n = Number.parseInt(raw, 10);
      if (!Number.isFinite(n) || n < 0) {
        toast.error(t("renewalFeeInvalid"));
        return;
      }
      renewalOfflineFineAmount = n;
    }
    const payload: BorrowRecordFormSubmitPayload = {
      ...formData,
      readerName: initialData?.readerName,
      bookTitle: initialData?.bookTitle,
      renewalOfflineFineAmount,
    };
    await onSubmit(payload);
    onOpenChange(false);
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setRenewalOfflineFineAmountStr("");
    onOpenChange(false);
  };

  const copyId = record?.copy?.id;
  const copyPatchPending = updatePhysicalCopyMutation.isPending;

  const copyReferencePriceDisplay = useMemo(() => {
    const ref = physicalCopyFineReferenceAmount(record?.copy);
    if (ref == null) return "—";
    const locale = i18n.language?.startsWith("vi") ? "vi-VN" : "en-US";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(ref);
  }, [record?.copy, i18n.language]);

  const patchPhysicalCopy = async (payload: {
    currentCondition?: PhysicalCopyCondition;
    status?: PhysicalCopyStatus;
  }) => {
    if (!copyId) return;
    try {
      await updatePhysicalCopyMutation.mutateAsync({ id: copyId, data: payload });
      const nextCondition =
        payload.currentCondition ??
        normalizePhysicalCondition(record?.copy?.currentCondition);
      const nextStatus =
        payload.status ?? normalizePhysicalStatus(record?.copy?.status);
      onBorrowRecordCopyUpdated?.({
        currentCondition: nextCondition,
        status: nextStatus,
      });
      toast.success(t("copyUpdateSuccess"));
    } catch {
      toast.error(t("copyUpdateError"));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record ? t("edit") : t("addNew")}</DialogTitle>
          <DialogDescription>
            {record ? t("editDescription") : t("addDescription")}
          </DialogDescription>
        </DialogHeader>

        
        {record && (
          <div className="grid gap-4 py-4 border-b mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t("reader")}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {t("fullName")}:
                  </span>
                  <span className="font-medium">
                    {record.reader?.fullName || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {t("cardNumber")}:
                  </span>
                  <span className="font-mono text-sm">
                    {record.reader?.cardNumber || "-"}
                  </span>
                </div>
                {record.reader?.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {t("phone")}:
                    </span>
                    <span className="text-sm">{record.reader.phone}</span>
                  </div>
                )}
                {(record.reader?.readerType?.typeName ||
                  record.reader?.readerType?.borrowDurationDays != null) && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      {t("borrowDurationDays")}:
                    </span>
                    <span className="text-sm">
                      {record.reader?.readerType?.borrowDurationDays ?? "—"}
                      {record.reader?.readerType?.typeName
                        ? ` · ${record.reader.readerType.typeName}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{t("physicalCopy")}</Badge>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">{t("book")}:</span>
                  <span className="font-medium">
                    {record.copy?.book?.title || record.book?.title || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {t("barcode")}:
                  </span>
                  <span className="font-mono text-sm">
                    {record.copy?.barcode || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {t("location")}:
                  </span>
                  <span className="text-sm">
                    {record.copy?.location?.name || "-"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {t("copyReferencePrice")}:
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {copyReferencePriceDisplay}
                  </span>
                </div>
                {record.copy?.conditionDetails ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-500 shrink-0">
                      {t("conditionDetailsReadonly")}:
                    </span>
                    <span className="text-sm text-right">
                      {record.copy.conditionDetails}
                    </span>
                  </div>
                ) : null}
                {copyId ? (
                  <>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500 shrink-0">
                        {t("physicalCopyConditionHint")}:
                      </span>
                      <Select
                        disabled={copyPatchPending}
                        value={normalizePhysicalCondition(
                          record.copy?.currentCondition,
                        )}
                        onValueChange={(value: PhysicalCopyCondition) =>
                          patchPhysicalCopy({ currentCondition: value })
                        }
                      >
                        <SelectTrigger
                          id="physicalCopyCurrentCondition"
                          className="h-8 max-w-[200px] text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PHYSICAL_COPY_CONDITIONS.map((c) => (
                            <SelectItem key={c} value={c}>
                              {tPc(`condition.${c}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-500 shrink-0">
                        {t("physicalCopyStatus")}:
                      </span>
                      <Select
                        disabled={copyPatchPending}
                        value={normalizePhysicalStatus(record.copy?.status)}
                        onValueChange={(value: PhysicalCopyStatus) =>
                          patchPhysicalCopy({ status: value })
                        }
                      >
                        <SelectTrigger
                          id="physicalCopyStatus"
                          className="h-8 max-w-[200px] text-sm"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BORROW_FORM_PHYSICAL_COPY_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {tPc(`status.${s}`)}
                            </SelectItem>
                          ))}
                          {normalizePhysicalStatus(record.copy?.status) ===
                          "damaged" ? (
                            <SelectItem value="damaged" disabled>
                              {tPc("status.damaged")}
                            </SelectItem>
                          ) : null}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            
            {!record && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="readerId">{t("reader")} </Label>
                  {initialData?.readerName ? (
                    <div className="space-y-1">
                      <Input
                        value={initialData.readerName}
                        disabled
                        className="bg-slate-100 dark:bg-slate-800"
                      />
                      <Input
                        type="hidden"
                        id="readerId"
                        value={formData.readerId}
                        required
                      />
                    </div>
                  ) : (
                    <Input
                      id="readerId"
                      type="text"
                      value={formData.readerId}
                      onChange={(e) =>
                        setFormData({ ...formData, readerId: e.target.value })
                      }
                      placeholder={t("readerIdPlaceholder")}
                      required
                    />
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="copyId">{t("Sách")} </Label>
                  {initialData?.bookTitle ? (
                    <div className="space-y-1">
                      <Input
                        value={initialData.bookTitle}
                        disabled
                        className="bg-slate-100 dark:bg-slate-800"
                      />
                      <Input
                        type="hidden"
                        id="copyId"
                        value={formData.copyId}
                        required
                      />
                    </div>
                  ) : (
                    <Input
                      id="copyId"
                      type="text"
                      value={formData.copyId}
                      onChange={(e) =>
                        setFormData({ ...formData, copyId: e.target.value })
                      }
                      placeholder={t("copyIdPlaceholder")}
                      required
                    />
                  )}
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor={record ? "borrowDate-view" : "borrowDate"}>
                {t("borrowDate")}
              </Label>
              {record ? (
                <Input
                  id="borrowDate-view"
                  readOnly
                  disabled
                  value={formatDateTimeDisplay(
                    formData.borrowDate,
                    i18n.language,
                  )}
                  className="bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <Input
                  id="borrowDate"
                  type="datetime-local"
                  value={
                    formData.borrowDate ? formData.borrowDate.slice(0, 16) : ""
                  }
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      borrowDate: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    })
                  }
                />
              )}
            </div>

            {!record && (
              <div className="grid gap-2">
                <Label htmlFor="borrowDurationDisplay">
                  {t("borrowDurationDays")}
                </Label>
                <Input
                  id="borrowDurationDisplay"
                  readOnly
                  value={String(policyBorrowDays)}
                  className="bg-slate-50 dark:bg-slate-900"
                />
                {readerFetched?.readerType?.typeName && (
                  <p className="text-xs text-muted-foreground">
                    {readerFetched.readerType.typeName}
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor={record ? "dueDate-view" : "dueDate"}>
                {t("dueDate")}
              </Label>
              {record ? (
                <Input
                  id="dueDate-view"
                  readOnly
                  disabled
                  value={formatDateTimeDisplay(formData.dueDate, i18n.language)}
                  className="bg-slate-100 dark:bg-slate-800"
                />
              ) : (
                <>
                  <Input
                    id="dueDate"
                    type="datetime-local"
                    value={
                      formData.dueDate ? formData.dueDate.slice(0, 16) : ""
                    }
                    readOnly
                    disabled
                    className="bg-slate-50 dark:bg-slate-900"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("dueDateAutoHint")}
                  </p>
                </>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">{t("status")} </Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: value,
                    returnDate:
                      value === "returned"
                        ? prev.returnDate ?? new Date().toISOString()
                        : undefined,
                  }))
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrowed">
                    {t("statusBorrowed")}
                  </SelectItem>
                  <SelectItem value="returned">
                    {t("statusReturned")}
                  </SelectItem>
                  <SelectItem value="overdue">{t("statusOverdue")}</SelectItem>
                  {record ? (
                    <SelectItem value="renewed">
                      {t("statusRenewed")}
                    </SelectItem>
                  ) : null}
                </SelectContent>
              </Select>
              {showRenewalOfflineFee ? (
                <div className="grid gap-2 pt-1">
                  <Label htmlFor="renewalOfflineFineAmount">
                    {t("renewalFeeLabel")}
                  </Label>
                  <Input
                    id="renewalOfflineFineAmount"
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    required
                    value={renewalOfflineFineAmountStr}
                    onChange={(e) =>
                      setRenewalOfflineFineAmountStr(e.target.value)
                    }
                    placeholder={
                      fineRules?.renewalFeeAmount != null
                        ? String(fineRules.renewalFeeAmount)
                        : undefined
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("renewalFeeHint")}
                  </p>
                </div>
              ) : null}
              {formData.status === "returned" ? (
                <div className="grid gap-2 pt-1">
                  <Label htmlFor="returnDate">{t("returnDate")}</Label>
                  <Input
                    id="returnDate"
                    type="datetime-local"
                    required
                    value={
                      formData.returnDate
                        ? formData.returnDate.slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        returnDate: e.target.value
                          ? new Date(e.target.value).toISOString()
                          : undefined,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("returnDateReturnedHint")}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="cursor-pointer"
            >
              {t("cancel")}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || copyPatchPending}
              className="cursor-pointer"
            >
              {isSubmitting ? t("loading") : t("save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
