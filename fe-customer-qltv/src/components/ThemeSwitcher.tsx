import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  type CustomerTheme,
  useTheme,
} from "@/providers/ThemeProvider";
import { Check, ChevronDown, Palette } from "lucide-react";

const THEME_OPTIONS: { value: CustomerTheme; label: string }[] = [
  { value: "default", label: "Mặc định (Emerald)" },
  { value: "theme-ocean", label: "Đại dương (Ocean)" },
  { value: "theme-rose", label: "Hoa hồng (Rose)" },
  { value: "theme-amber", label: "Hổ phách (Amber)" },
  { value: "theme-royal", label: "Hoàng gia (Royal)" },
];

function currentLabel(theme: CustomerTheme) {
  return THEME_OPTIONS.find((o) => o.value === theme)?.label ?? "";
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const label = currentLabel(theme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="h-auto min-h-10 w-full justify-between gap-2 rounded-xl border-border bg-card px-4 py-2.5 text-left text-sm font-medium text-card-foreground hover:bg-muted/80"
            aria-label={`Chọn giao diện màu. Đang dùng: ${label}`}
          />
        }
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <Palette
            className="size-4 shrink-0 text-primary"
            aria-hidden
          />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground">
            Giao diện
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {THEME_OPTIONS.map((opt) => (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className="justify-between gap-2"
            >
              <span>{opt.label}</span>
              {theme === opt.value ? (
                <Check className="size-4 shrink-0 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
