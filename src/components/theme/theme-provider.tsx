"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = "appTheme";

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

function applyTheme(theme: Theme) {
  if (!hasWindow()) return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): Theme {
  if (!hasWindow()) return "light";
  const raw = window.localStorage.getItem(THEME_STORAGE_KEY);
  return raw === "dark" ? "dark" : "light";
}

function writeStoredTheme(theme: Theme) {
  if (!hasWindow()) return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>("light");

  React.useEffect(() => {
    const nextTheme = readStoredTheme();
    setThemeState(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme);
    writeStoredTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  const value = React.useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [setTheme, theme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return ctx;
}
