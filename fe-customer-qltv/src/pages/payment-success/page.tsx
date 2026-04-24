import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";


export function PaymentSuccessPage() {
  const { t } = useTranslation("pages");

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-6 text-center max-w-xl">
        <div className="rounded-full bg-emerald-100 p-6 text-[#18AD5B]">
          <CheckCircle className="w-16 h-16" strokeWidth={2} aria-hidden />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#18AD5B] leading-tight tracking-tight">
          {t("payment.successTitle")}
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          {t("payment.successSubtitle")}
        </p>
      </div>
      <Link
        to="/history-fines"
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "rounded-2xl bg-[#18AD5B] hover:bg-[#46C37B] font-bold px-8 text-primary-foreground",
        )}
      >
        {t("payment.backToFines")}
      </Link>
    </div>
  );
}
