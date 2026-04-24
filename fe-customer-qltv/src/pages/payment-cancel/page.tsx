import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PaymentCancelPage() {
  const { t } = useTranslation("pages");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <div className="rounded-full bg-amber-50 p-6 text-amber-600">
          <XCircle className="w-16 h-16" strokeWidth={2} aria-hidden />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
          {t("payment.cancelTitle")}
        </h1>
        <p className="text-lg text-slate-600 font-medium">{t("payment.cancelSubtitle")}</p>
      </div>
      <Link
        to="/history-fines?tab=pending"
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "rounded-2xl font-bold px-8",
        )}
      >
        {t("payment.backToFines")}
      </Link>
    </div>
  );
}
