import { useTranslation } from "react-i18next";
import { Book } from "lucide-react";
import { motion } from "framer-motion";
import { premiumEasing } from "@/lib/animation";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: premiumEasing },
};

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.15,
    },
  },
};

interface AuthBrandProps {
  className?: string;
}

export function AuthBrand({ className }: AuthBrandProps) {
  const { t } = useTranslation("pages");
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className={`mb-12 text-center relative z-10 ${className || ""}`}
    >
      <motion.div
        variants={fadeInUp}
        className="inline-flex items-center gap-3 mb-4"
      >
        <div className="relative">
          <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-xl shadow-primary/20">
            <Book className="w-6 h-6 text-primary-foreground" strokeWidth={2} />
          </div>
          <div className="absolute inset-1 rounded-[1rem] border border-white/10 pointer-events-none" />
        </div>
      </motion.div>
      <motion.h2
        variants={fadeInUp}
        className="text-2xl font-black tracking-tight text-foreground"
      >
        Emerald Scholar
      </motion.h2>
      <motion.p
        variants={fadeInUp}
        className="text-muted-foreground text-sm mt-1"
      >
        {t("authBrand.subtitle")}
      </motion.p>
    </motion.div>
  );
}
