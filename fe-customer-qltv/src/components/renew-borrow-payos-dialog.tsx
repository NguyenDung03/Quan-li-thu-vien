import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRenewBook } from "@/hooks/useBorrowRecord";

type RenewBorrowPayOsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  borrowRecordId: string | null;
  bookTitle?: string;
};

export function RenewBorrowPayOsDialog({
  open,
  onOpenChange,
  borrowRecordId,
  bookTitle,
}: RenewBorrowPayOsDialogProps) {
  const { t } = useTranslation("pages");
  const { renewBookAsync, renewBookLoading } = useRenewBook();

  const handlePayOs = async () => {
    if (!borrowRecordId) return;
    try {
      await renewBookAsync(borrowRecordId);
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err.response?.data?.message ||
          err.message ||
          t("renewBorrowPayOs.checkoutFail"),
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("renewBorrowPayOs.title")}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-sm text-slate-600">
          {bookTitle ? (
            <p className="font-semibold text-slate-900">{bookTitle}</p>
          ) : null}
          <p>{t("renewBorrowPayOs.payOsIntro")}</p>
          <p className="text-slate-500">{t("renewBorrowPayOs.counterHint")}</p>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-xl"
            onClick={() => onOpenChange(false)}
            disabled={renewBookLoading}
          >
            {t("renewBorrowPayOs.close")}
          </Button>
          <Button
            type="button"
            className="rounded-xl bg-[#18AD5B] font-bold hover:bg-[#46C37B]"
            onClick={handlePayOs}
            disabled={!borrowRecordId || renewBookLoading}
          >
            {renewBookLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                {t("renewBorrowPayOs.openingCheckout")}
              </>
            ) : (
              t("renewBorrowPayOs.payWithPayOs")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
