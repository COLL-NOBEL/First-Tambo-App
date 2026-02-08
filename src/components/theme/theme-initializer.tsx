"use client";

import { useEffect } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function getPreferredTheme(): Theme {
  let storedTheme: string | null = null;
  try {
    storedTheme = window.localStorage.getItem("theme");
  } catch {
    storedTheme = null;
  }

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
    ? "dark"
    : "light";
}

export function ThemeInitializer() {
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  return null;
}
