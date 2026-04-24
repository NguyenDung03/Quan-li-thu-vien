import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { motion } from "framer-motion";
import { premiumEasing } from "@/lib/animation";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "react-i18next";

export function DashboardHeader() {
  const { t } = useTranslation("pages");
  const { user } = useAuth();

  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: premiumEasing }}
      className="h-16 flex items-center justify-between px-6 bg-card border-b border-primary/15 shrink-0"
    >
      
      <div className="flex items-center gap-3 w-1/4">
        <div className="h-7 w-[34px] rounded bg-primary/10 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4 text-primary"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-primary">EduLib</h1>
      </div>

      
      <div className="flex-1 max-w-lg px-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={18}
          />
          <Input
            placeholder={t("header.searchPlaceholder")}
            className="border-border bg-muted/70 text-foreground placeholder:text-muted-foreground pl-12 pr-4 rounded-xl h-10"
          />
        </div>
      </div>

      
      <div className="flex items-center justify-end gap-4 w-1/4">
        <Button
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-card"></span>
        </Button>
        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-foreground">{user?.fullName || user?.username || 'User'}</p>
            <p className="text-[10px] text-muted-foreground">{user?.role === 'admin' ? t('header.roleAdmin') : t('header.roleStudent')}</p>
          </div>
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={user?.avatar} />
            <AvatarFallback className="bg-primary/20 text-primary text-xs">
              {user?.fullName?.slice(0, 2).toUpperCase() || user?.username?.slice(0, 2).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </motion.header>
  );
}
