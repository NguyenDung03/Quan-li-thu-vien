import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useReservationStats } from "@/hooks/use-reservations";

const formatCount = (n: number) => new Intl.NumberFormat("vi-VN").format(n);

const colorIconWrap: Record<string, string> = {
  blue: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  purple: "bg-purple-100 dark:bg-purple-900/30 text-purple-600",
  green: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600",
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-600",
};

type StatRow = {
  titleKey: string;
  badgeKey: string;
  badgeKeyUrgent?: string;
  changeType: "positive" | "negative" | "neutral";
  icon: typeof ClipboardList;
  color: keyof typeof colorIconWrap;
  countKey: "all" | "pending" | "fulfilled" | "closed";
};

const STAT_DEFS: StatRow[] = [
  {
    titleKey: "reservations.statsTotalTitle",
    badgeKey: "reservations.statsTotalBadge",
    changeType: "neutral",
    icon: ClipboardList,
    color: "blue",
    countKey: "all",
  },
  {
    titleKey: "reservations.statsPendingTitle",
    badgeKey: "reservations.statsPendingBadge",
    badgeKeyUrgent: "reservations.statsPendingBadgeUrgent",
    changeType: "neutral",
    icon: Clock,
    color: "purple",
    countKey: "pending",
  },
  {
    titleKey: "reservations.statsFulfilledTitle",
    badgeKey: "reservations.statsFulfilledBadge",
    changeType: "positive",
    icon: CheckCircle2,
    color: "green",
    countKey: "fulfilled",
  },
  {
    titleKey: "reservations.statsClosedTitle",
    badgeKey: "reservations.statsClosedBadge",
    changeType: "neutral",
    icon: Ban,
    color: "slate",
    countKey: "closed",
  },
];

export function ReservationsStatsCards() {
  const { t } = useTranslation("common");
  const { counts, loading } = useReservationStats();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {STAT_DEFS.map((stat) => {
        const raw = counts[stat.countKey];
        const value = loading ? "—" : formatCount(raw);
        const isPending = stat.countKey === "pending";
        const badgeText =
          isPending && raw > 0 && stat.badgeKeyUrgent
            ? t(stat.badgeKeyUrgent)
            : t(stat.badgeKey);
        const effectiveChangeType =
          isPending && raw > 0 ? "negative" : stat.changeType;

        const Icon = stat.icon;

        return (
          <Card
            key={stat.countKey}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={cn(
                    "p-2 rounded-lg",
                    colorIconWrap[stat.color] ?? colorIconWrap.blue,
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded-full",
                    effectiveChangeType === "positive" &&
                      "text-green-600 bg-green-100 dark:bg-green-950/40 dark:text-green-400",
                    effectiveChangeType === "negative" &&
                      "text-red-600 bg-red-100 dark:bg-red-950/40 dark:text-red-400",
                    effectiveChangeType === "neutral" &&
                      "text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400",
                  )}
                >
                  {badgeText}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                {t(stat.titleKey)}
              </p>
              <h3 className="text-2xl font-bold mt-1 tabular-nums">{value}</h3>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
