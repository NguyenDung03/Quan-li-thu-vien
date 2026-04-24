import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useSidebarStore } from "@/stores/sidebar-store";
import {
  AlertTriangle,
  ArrowLeftRight,
  Book,
  Building,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  LayoutDashboard,
  Library,
  LogOut,
  MapPin,
  Smartphone,
  Tags,
  UserCog,
  Users,
  FileBox,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  titleKey: string;
  href: string;
  icon: React.ElementType;
}

interface NavGroup {
  titleKey: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    titleKey: "sidebar.groups.dashboard",
    items: [
      {
        titleKey: "sidebar.dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    titleKey: "sidebar.groups.userManagement",
    items: [
      {
        titleKey: "sidebar.users",
        href: "/dashboard/users",
        icon: UserCog,
      },
      {
        titleKey: "sidebar.readers",
        href: "/dashboard/readers",
        icon: Users,
      },
      {
        titleKey: "sidebar.borrow",
        href: "/dashboard/borrow",
        icon: ArrowLeftRight,
      },
      {
        titleKey: "sidebar.readerTypes",
        href: "/dashboard/reader-types",
        icon: Library,
      },
      {
        titleKey: "sidebar.reservations",
        href: "/dashboard/reservations",
        icon: CalendarCheck,
      },
    ],
  },
  {
    titleKey: "sidebar.groups.bookManagement",
    items: [
      {
        titleKey: "sidebar.books",
        href: "/dashboard/books",
        icon: Book,
      },
      {
        titleKey: "sidebar.authors",
        href: "/dashboard/authors",
        icon: UserCog,
      },
      {
        titleKey: "sidebar.publishers",
        href: "/dashboard/publishers",
        icon: Building,
      },
      {
        titleKey: "sidebar.gradeLevels",
        href: "/dashboard/grade-levels",
        icon: GraduationCap,
      },
      {
        titleKey: "sidebar.bookCategories",
        href: "/dashboard/book-categories",
        icon: Tags,
      },
      {
        titleKey: "sidebar.locations",
        href: "/dashboard/locations",
        icon: MapPin,
      },
      {
        titleKey: "sidebar.physicalCopies",
        href: "/dashboard/physical-copies",
        icon: FileBox,
      },
      {
        titleKey: "sidebar.ebooks",
        href: "/dashboard/ebooks",
        icon: Smartphone,
      },
    ],
  },
  {
    titleKey: "sidebar.groups.penaltyManagement",
    items: [
      {
        titleKey: "sidebar.violations",
        href: "/dashboard/violations",
        icon: AlertTriangle,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCollapsed, toggleSidebar } = useSidebarStore();
  const { t } = useTranslation("common");
  const { user, reader, logout } = useAuth();

  const userDisplayName = reader?.fullName || user?.username || "Admin";
  const userRole = user?.role === "admin" ? "Quản trị viên" : "Người dùng";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-700 dark:bg-slate-800 md:flex",
        isCollapsed ? "w-20" : "w-72",
        className,
      )}
    >
      
      <div
        className={cn(
          "flex shrink-0 flex-row items-center",
          isCollapsed
            ? "justify-between gap-1 border-b border-slate-100 px-2 py-2.5 dark:border-slate-700/80"
            : "gap-3 p-4",
        )}
      >
        <div
          className={cn(
            "flex shrink-0 items-center justify-center rounded-xl bg-primary text-white",
            isCollapsed ? "h-9 w-9" : "h-10 w-10",
          )}
        >
          <Library className={cn(isCollapsed ? "h-4 w-4" : "h-5 w-5")} />
        </div>
        <div
          className={cn(
            "min-w-0 flex-1 overflow-hidden transition-all duration-300",
            isCollapsed ? "hidden" : "opacity-100",
          )}
        >
          <h1 className="text-lg font-bold leading-tight tracking-tight whitespace-nowrap">
            {t("sidebar.schoolName")}
          </h1>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 whitespace-nowrap dark:text-slate-400">
            {t("sidebar.systemName")}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={toggleSidebar}
          title={isCollapsed ? t("sidebar.expand") : t("sidebar.collapse")}
          className={cn(
            "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white p-0 shadow-md transition-all duration-200",
            "text-slate-600 hover:border-[#00b760] hover:bg-[#00b760] hover:text-white",
            "dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-[#00b760] dark:hover:bg-[#00b760] dark:hover:text-white",
            "[&_svg]:size-[14px]",
            !isCollapsed && "ml-auto",
          )}
        >
          {isCollapsed ? (
            <ChevronRight aria-hidden className="shrink-0" strokeWidth={2} />
          ) : (
            <ChevronLeft aria-hidden className="shrink-0" strokeWidth={2} />
          )}
        </Button>
      </div>

      
      <nav
        className={cn(
          "mt-2 min-h-0 flex-1 space-y-3 overflow-y-auto px-2 pb-10 scrollbar-hide",
          !isCollapsed && "px-4",
        )}
      >
        {navGroups.map((group) => (
          <div key={group.titleKey} className="space-y-1">
            
            <div
              className={cn(
                "text-sm font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider transition-all duration-300",
                isCollapsed ? "opacity-0 hidden" : "opacity-100 px-4 py-2",
              )}
            >
              {t(group.titleKey)}
            </div>

            
            {group.items.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-sm font-semibold transition-all duration-300",
                    isCollapsed ? "justify-center px-2 py-3" : "px-4 py-3",
                    isActive
                      ? "bg-primary/10 text-primary border-r-3 border-primary"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50",
                  )}
                  title={isCollapsed ? t(item.titleKey) : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  <span
                    className={cn(
                      "text-sm whitespace-nowrap transition-all duration-300",
                      isCollapsed
                        ? "w-0 opacity-0 overflow-hidden"
                        : "opacity-100",
                    )}
                  >
                    {t(item.titleKey)}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
        <div className="h-4 shrink-0" aria-hidden />
      </nav>

      
      <div className="shrink-0 border-t border-slate-200 p-2 dark:border-slate-700">
        <div
          className={cn(
            "flex items-center gap-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 transition-all duration-300",
            isCollapsed ? "justify-center" : "",
          )}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-primary/10">
            <span className="text-primary font-semibold">
              {userDisplayName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 overflow-hidden transition-all duration-300",
              isCollapsed ? "w-0 opacity-0" : "opacity-100",
            )}
          >
            <p className="text-sm font-semibold truncate whitespace-nowrap">
              {userDisplayName}
            </p>
            <p className="text-xs text-slate-500 truncate whitespace-nowrap">
              {userRole}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              "text-slate-400 hover:text-primary transition-colors shrink-0",
              isCollapsed ? "hidden" : "",
            )}
            title={t("common.logout")}
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
