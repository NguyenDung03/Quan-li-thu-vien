import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Globe, Palette } from "lucide-react";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const languages = [
  { code: "vn" as const, labelKey: "settingsPage.vietnamese" },
  { code: "en" as const, labelKey: "settingsPage.english" },
];

export function SettingsPage() {
  const { t, i18n: i18nInstance } = useTranslation("common");
  const current = i18nInstance.language.startsWith("en") ? "en" : "vn";

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mx-auto max-w-2xl space-y-6"
      >
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("settingsPage.title")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("settingsPage.subtitle")}
          </p>
        </header>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <Globe className="h-5 w-5 text-primary" aria-hidden />
              {t("settingsPage.languageSection")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.languageDescription")}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-col gap-2 sm:flex-row">
              {languages.map(({ code, labelKey }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => {
                    void i18nInstance.changeLanguage(code);
                  }}
                  className={cn(
                    "flex-1 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all duration-200",
                    current === code
                      ? "border-primary bg-primary/10 text-foreground ring-2 ring-primary/30"
                      : "border-border bg-muted/40 text-foreground hover:border-border hover:bg-muted/70",
                  )}
                >
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-card-foreground">
              <Palette className="h-5 w-5 text-primary" aria-hidden />
              {t("settingsPage.themeSection")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("settingsPage.themeDescription")}
            </p>
          </CardHeader>
          <CardContent className="pt-0">
            <ThemeSwitcher />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
