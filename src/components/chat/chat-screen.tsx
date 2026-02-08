"use client";

import { MessageThreadFull } from "@/components/tambo/message-thread-full";
import { useMcpServers } from "@/components/tambo/mcp-config-modal";
import { components, tools } from "@/lib/tambo";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { TamboProvider } from "@tambo-ai/react";

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

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const preferredTheme = getPreferredTheme();
    setTheme(preferredTheme);
    applyTheme(preferredTheme);
  }, []);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const nextTheme = currentTheme === "dark" ? "light" : "dark";
      try {
        window.localStorage.setItem("theme", nextTheme);
      } catch {
        // Ignore storage errors (e.g. disabled cookies/storage)
      }
      applyTheme(nextTheme);
      return nextTheme;
    });
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex items-center justify-center rounded-md border border-border bg-background p-2 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {theme === "dark" ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}

/**
* Full-screen Tambo chat experience.
*/
export function ChatScreen() {
  const mcpServers = useMcpServers();

  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY!}
      components={components}
      tools={tools}
      tamboUrl={process.env.NEXT_PUBLIC_TAMBO_URL}
      mcpServers={mcpServers}
    >
      <div className="relative h-screen">
        <div className="fixed right-4 top-4 z-50">
          <ThemeToggle />
        </div>

        <MessageThreadFull />
      </div>
    </TamboProvider>
  );
}
