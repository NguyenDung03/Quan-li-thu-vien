/* eslint-disable react-refresh/only-export-components -- provider + useTheme + shared theme types */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const CUSTOMER_THEME_STORAGE_KEY = "customer-theme";

export const CUSTOMER_THEME_CLASSES = [
  "theme-ocean",
  "theme-rose",
  "theme-amber",
  "theme-royal",
] as const;

export type CustomerThemeClass = (typeof CUSTOMER_THEME_CLASSES)[number];

export type CustomerTheme = "default" | CustomerThemeClass;

function isCustomerTheme(value: string | null): value is CustomerTheme {
  if (value === "default") return true;
  return (CUSTOMER_THEME_CLASSES as readonly string[]).includes(value ?? "");
}

function readStoredTheme(): CustomerTheme {
  try {
    const raw = globalThis.localStorage?.getItem(CUSTOMER_THEME_STORAGE_KEY);
    if (raw && isCustomerTheme(raw)) return raw;
  } catch {
    /* ignore */
  }
  return "default";
}

function applyThemeClass(theme: CustomerTheme) {
  const root = document.documentElement;
  for (const cls of CUSTOMER_THEME_CLASSES) {
    root.classList.remove(cls);
  }
  if (theme !== "default") {
    root.classList.add(theme);
  }
}

type ThemeContextValue = {
  theme: CustomerTheme;
  setTheme: (theme: CustomerTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const [theme, setThemeState] = useState<CustomerTheme>(() =>
    readStoredTheme(),
  );

  const setTheme = useCallback((next: CustomerTheme) => {
    setThemeState(next);
  }, []);

  useEffect(() => {
    try {
      globalThis.localStorage?.setItem(CUSTOMER_THEME_STORAGE_KEY, theme);
    } catch {
      /* ignore */
    }
    applyThemeClass(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
    }),
    [theme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
