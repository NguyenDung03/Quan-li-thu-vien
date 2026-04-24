import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { getCategoryIcon } from "@/features/library/utils/get-category-icon";
import type { BookCategory, GradeLevel } from "@/types/book.type";

type LibraryFilterBarProps = {
  gradeLevels: GradeLevel[];
  categories: BookCategory[];
  selectedGrade: string | null;
  selectedCategory: string | null;
  loading: boolean;
  onSelectGrade: (id: string | null) => void;
  onSelectCategory: (id: string | null) => void;
};

export function LibraryFilterBar({
  gradeLevels,
  categories,
  selectedGrade,
  selectedCategory,
  loading,
  onSelectGrade,
  onSelectCategory,
}: LibraryFilterBarProps) {
  const { t } = useTranslation("pages");
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-card rounded-md p-4 shadow-sm border border-border/80 mb-8"
    >
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Khối lớp:
          </span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectGrade(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  !selectedGrade
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("library.tabAll")}
              </button>
              {gradeLevels.map((level, idx) => (
                <button
                  type="button"
                  key={`grade-${level.id ?? "noid"}-${idx}`}
                  onClick={() => onSelectGrade(level.id || null)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                    selectedGrade === level.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {level.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-px h-8 " />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {t("library.category")}
          </span>
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onSelectCategory(null)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {t("library.tabAll")}
              </button>
              {categories.map((category, idx) => {
                const CategoryIcon = getCategoryIcon(category.name);
                return (
                  <button
                    type="button"
                    key={`category-${category.id ?? "noid"}-${idx}`}
                    onClick={() => onSelectCategory(category.id || null)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      selectedCategory === category.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <CategoryIcon size={12} strokeWidth={2} />
                    {category.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {(selectedGrade || selectedCategory) && (
          <>
            <div className="w-px h-8 bg-border" />
            <button
              type="button"
              onClick={() => {
                onSelectGrade(null);
                onSelectCategory(null);
                navigate("/library");
              }}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <X className="w-3 h-3" />
              {t("library.clearFilters")}
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
