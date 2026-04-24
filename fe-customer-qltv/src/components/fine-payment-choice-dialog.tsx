import { useState, type ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import type { Fine } from "@/types/fine.type";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { requestFinePayOsRedirect } from "@/lib/request-fine-payos-checkout";

type FinePaymentChoiceDialogProps = Readonly<{
  fine: Fine;
  triggerClassName?: string;
  size?: ComponentProps<typeof Button>["size"];
}>;

type ModalStep = "choice" | "counter";

export function FinePaymentChoiceDialog({
  fine,
  triggerClassName,
  size,
}: FinePaymentChoiceDialogProps) {
  const { t } = useTranslation("pages");
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ModalStep>("choice");
  const [loading, setLoading] = useState(false);

  const fineId = fine.id;
  const borrowRecordId = fine.borrowRecord?.id ?? fine.borrowId;
  const triggerDisabled = !fineId || !borrowRecordId;

  const triggerLabel =
    fine.status === "pending" ? t("historyFines.resumePay") : t("historyFines.payNow");

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setStep("choice");
      setLoading(false);
    }
  };

  const handlePayOs = async () => {
    try {
      setLoading(true);
      await requestFinePayOsRedirect(fine);
    } catch (err: unknown) {
      console.error("PayOS init error:", err);
      const apiMsg = (err as { response?: { data?: { message?: string } } })?.response
        ?.data?.message;
      let msg = apiMsg ?? t("payment.errors.generic");
      if (!apiMsg && err instanceof Error) {
        if (err.message === "MISSING_CHECKOUT_URL") msg = t("payment.errors.noCheckoutUrl");
        else if (err.message === "INVALID_FINE") msg = t("payment.errors.invalidFine");
      }
      alert(msg);
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        size={size}
        className={triggerClassName}
        disabled={triggerDisabled}
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className="max-w-md rounded-[1.5rem] border-0 p-6 shadow-2xl sm:max-w-md"
          showCloseButton
        >
          {step === "choice" ? (
            <>
              <DialogHeader className="gap-2 text-left">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {t("historyFines.payModal.title")}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  {t("historyFines.payModal.subtitle")}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-2 flex flex-col gap-3">
                <Button
                  type="button"
                  className="w-full rounded-xl bg-[#18AD5B] font-bold text-primary-foreground hover:bg-[#46C37B]"
                  disabled={loading}
                  onClick={handlePayOs}
                >
                  {loading ? t("payment.payNowLoading") : t("historyFines.payModal.payOs")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full rounded-xl font-bold border-slate-100"
                  disabled={loading}
                  onClick={() => setStep("counter")}
                >
                  {t("historyFines.payModal.atCounter")}
                </Button>
              </div>
            </>
          ) : (
            <>
              <DialogHeader className="gap-2 text-left">
                <DialogTitle className="text-lg font-bold text-slate-900">
                  {t("historyFines.payModal.counterTitle")}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-slate-600">
                  {t("historyFines.payModal.counterBody")}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl font-bold"
                  onClick={() => setStep("choice")}
                >
                  {t("historyFines.payModal.back")}
                </Button>
                <Button
                  type="button"
                  className="rounded-xl bg-[#18AD5B] font-bold text-primary-foreground hover:bg-[#46C37B]"
                  onClick={() => handleOpenChange(false)}
                >
                  {t("historyFines.payModal.understood")}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
