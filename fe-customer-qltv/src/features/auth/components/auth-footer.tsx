import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { premiumEasing } from "@/lib/animation";
import { cn } from "@/lib/utils";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: premiumEasing },
};

interface AuthFooterProps {
  className?: string;
  year?: number;
}

export function AuthFooter({
  className,
  year = new Date().getFullYear(),
}: AuthFooterProps) {
  const { t } = useTranslation("pages");
  return (
    <motion.footer
      variants={fadeInUp}
      className={cn("mt-12 w-full max-w-[440px] relative z-10", className)}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-8">
          <Link
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            to="#"
          >
            {t("authFooter.terms")}
          </Link>
          <Link
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            to="#"
          >
            {t("authFooter.privacy")}
          </Link>
          <Link
            className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
            to="#"
          >
            {t("authFooter.contact")}
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground/60 tracking-wide">
          {t("authFooter.copyright", { year })}
        </p>
      </div>
    </motion.footer>
  );
}
