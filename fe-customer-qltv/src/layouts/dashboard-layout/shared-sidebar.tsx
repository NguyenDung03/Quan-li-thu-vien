import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/auth-context";
import {
  Home,
  User,
  History,
  BookOpen,
  Settings,
  LogOut,
  Bell,
  ChevronLeft,
  ChevronRight,
  FileText,
  Bookmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useBorrowRecordNotifier } from "@/pages/notifications/borrow-record-notifier";


const mainNavItems = [
  { labelKey: "nav.home", icon: Home, href: "/" },
  { labelKey: "nav.library", icon: BookOpen, href: "/library" },
  { labelKey: "nav.profile", icon: User, href: "/profile" },
  { labelKey: "nav.historyRead", icon: History, href: "/history-read" },
  { labelKey: "nav.borrowRecords", icon: FileText, href: "/borrow-records" },
  { labelKey: "nav.reservation", icon: Bookmark, href: "/history-reservation" },
  { labelKey: "nav.historyFines", icon: BookOpen, href: "/history-fines" },
] as const;

interface SharedSidebarProps {
  collapsed?: boolean;
  visible?: boolean;
  onToggle?: () => void;
}

export function SharedSidebar({
  collapsed = false,
  visible = true,
  onToggle,
}: SharedSidebarProps) {
  const { t } = useTranslation("common");
  const location = useLocation();
  const [localCollapsed, setLocalCollapsed] = useState(collapsed);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [newBorrowNotifications, setNewBorrowNotifications] = useState(0);
  const [latestBorrowMessage, setLatestBorrowMessage] = useState("");

  
  const { logout } = useAuth();

  const handleBorrowCreated = useCallback((payload: { message: string }) => {
    setNewBorrowNotifications((prev) => prev + 1);
    setLatestBorrowMessage(payload.message || t("notifications.newSingle"));
    toast.success(payload.message || t("notifications.newSingle"));
  }, [t]);

  const handleClearBorrowHighlight = useCallback(() => {
    setNewBorrowNotifications(0);
    setLatestBorrowMessage("");
  }, []);

  useBorrowRecordNotifier({
    onCreated: handleBorrowCreated,
  });

  
  const handleLogout = async () => {
    setShowLogoutDialog(false);
    await logout();
  };

  
  const effectiveCollapsed = onToggle ? collapsed : localCollapsed;
  const handleToggle = onToggle || (() => setLocalCollapsed(!localCollapsed));

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  let borrowNotificationSummary = t("notifications.empty");
  if (newBorrowNotifications === 1) {
    borrowNotificationSummary = t("notifications.newSingle");
  } else if (newBorrowNotifications > 1) {
    borrowNotificationSummary = t("notifications.newPlural", {
      count: newBorrowNotifications,
    });
  }

  if (!visible) return null;

  return (
    <motion.aside
      initial={false}
      animate={{ width: effectiveCollapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="bg-sidebar border-r border-sidebar-border flex flex-col hidden md:flex relative z-20"
    >
      
      <div className="absolute -right-3 top-6 z-30">
        <Button
          onClick={handleToggle}
          className={`w-6 h-6 rounded-full p-0 bg-card border-2 border-border hover:bg-primary hover:border-primary hover:text-primary-foreground shadow-md transition-all duration-200 ${
            effectiveCollapsed ? "rotate-180" : ""
          }`}
        >
          {effectiveCollapsed ? (
            <ChevronRight size={14} />
          ) : (
            <ChevronLeft size={14} />
          )}
        </Button>
      </div>

      
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="p-3">
          
          <nav className="flex flex-col gap-1">
            {mainNavItems.map((item) => (
              <Link
                key={item.labelKey}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-md border transition-all duration-200 ${
                  isActive(item.href)
                    ? "border-primary/20 bg-primary/10 text-primary font-semibold shadow-sm"
                    : "border-transparent text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground font-medium"
                } ${effectiveCollapsed ? "justify-center" : ""}`}
                title={effectiveCollapsed ? t(item.labelKey) : undefined}
              >
                <item.icon
                  size={20}
                  strokeWidth={isActive(item.href) ? 2.5 : 2}
                />
                {!effectiveCollapsed && (
                  <span className="text-sm">{t(item.labelKey)}</span>
                )}
              </Link>
            ))}
          </nav>

          
          {!effectiveCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={
                newBorrowNotifications > 0
                  ? {
                      opacity: 1,
                      y: 0,
                      boxShadow: [
                        "0 0 0 0 rgba(0, 183, 96, 0.5)",
                        "0 0 0 10px rgba(0, 183, 96, 0)",
                        "0 0 0 0 rgba(0, 183, 96, 0)",
                      ],
                    }
                  : { opacity: 1, y: 0 }
              }
              transition={
                newBorrowNotifications > 0
                  ? {
                      boxShadow: {
                        duration: 1.8,
                        repeat: Infinity,
                        ease: "easeOut",
                      },
                      opacity: { duration: 0.35 },
                      y: { duration: 0.35 },
                    }
                  : { duration: 0.35 }
              }
              className={`mt-4 p-4 rounded-2xl border transition-colors duration-300 ${
                newBorrowNotifications > 0
                  ? "bg-gradient-to-br from-[#00b760]/25 to-[#46C37B]/15 border-[#00b760] ring-2 ring-[#00b760]/45 shadow-lg shadow-[#00b760]/15"
                  : "bg-gradient-to-br from-[#00b760]/10 to-[#46C37B]/5 border-[#00b760]/20"
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <motion.span
                    animate={
                      newBorrowNotifications > 0
                        ? {
                            rotate: [0, -12, 12, -8, 8, 0],
                            scale: [1, 1.15, 1],
                          }
                        : {}
                    }
                    transition={{
                      duration: 0.6,
                      repeat: newBorrowNotifications > 0 ? Infinity : 0,
                      repeatDelay: 2.2,
                    }}
                    className="inline-flex shrink-0"
                  >
                    <Bell
                      size={14}
                      className="text-[#00b760]"
                      strokeWidth={2}
                    />
                  </motion.span>
                  <p className="text-[10px] font-bold text-[#00b760] uppercase tracking-wider truncate">
                    {t("notifications.title")}
                  </p>
                </div>
                {newBorrowNotifications > 0 ? (
                  <span className="shrink-0 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-[#00b760] text-white text-[10px] font-black tabular-nums animate-pulse">
                    {newBorrowNotifications > 99
                      ? "99+"
                      : newBorrowNotifications}
                  </span>
                ) : null}
              </div>
              <p
                className={`text-xs mb-3 leading-relaxed ${
                  newBorrowNotifications > 0
                    ? "text-slate-800 font-semibold"
                    : "text-slate-600"
                }`}
              >
                {borrowNotificationSummary}
              </p>
              {newBorrowNotifications > 0 ? (
                <p className="text-[11px] text-[#00b760] font-medium mb-2 line-clamp-2">
                  {latestBorrowMessage}
                </p>
              ) : null}
              <Link to="/borrow-records" onClick={handleClearBorrowHighlight}>
                <Button
                  size="sm"
                  className={`w-full text-white text-xs font-bold rounded-xl h-9 ${
                    newBorrowNotifications > 0
                      ? "bg-[#00b760] hover:bg-[#009952] shadow-md shadow-[#00b760]/30"
                      : "bg-[#00b760] hover:bg-[#46C37B]"
                  }`}
                >
                  {t("notifications.cta")}
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>

      
      <div className="border-t border-sidebar-border p-3">
        <nav
          className={`flex flex-col gap-1 ${effectiveCollapsed ? "items-center" : ""}`}
        >
          <Link
            to="/settings"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              location.pathname === "/settings"
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            } ${effectiveCollapsed ? "justify-center w-12" : ""}`}
            title={
              effectiveCollapsed ? t("footer.settings") : undefined
            }
          >
            <Settings size={18} strokeWidth={2} />
            {!effectiveCollapsed && <span>{t("footer.settings")}</span>}
          </Link>
          <button
            onClick={() => setShowLogoutDialog(true)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-all duration-200 ${
              effectiveCollapsed ? "justify-center w-12" : ""
            }`}
            title={effectiveCollapsed ? t("footer.logout") : undefined}
          >
            <LogOut size={18} strokeWidth={2} />
            {!effectiveCollapsed && <span>{t("footer.logout")}</span>}
          </button>
        </nav>
      </div>

      
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent showCloseButton={false} className="sm:max-w-[420px]">
          <div className="flex gap-4">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive"
              aria-hidden
            >
              <LogOut className="h-6 w-6" strokeWidth={2} />
            </div>
            <DialogHeader className="min-w-0 flex-1 gap-3 space-y-0 p-0 text-left">
              <DialogTitle className="text-lg font-semibold leading-snug">
                {t("logoutDialog.title")}
              </DialogTitle>
              <DialogDescription>
                {t("logoutDialog.description")}
              </DialogDescription>
            </DialogHeader>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="min-h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
              onClick={() => setShowLogoutDialog(false)}
            >
              {t("logoutDialog.cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="min-h-10 w-full sm:w-auto sm:min-w-[7.5rem]"
              onClick={handleLogout}
            >
              {t("logoutDialog.confirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.aside>
  );
}

export default SharedSidebar;
