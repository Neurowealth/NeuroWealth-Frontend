"use client";

import { createContext, useCallback, useContext, useEffect, useState, ReactNode, useMemo } from "react";
import { THEME_STORAGE_KEY } from "@/lib/theme-persistence";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function getStoredTheme(): ThemeMode {
  if (typeof globalThis.window === "undefined") return "system";
  try {
    const stored = globalThis.window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {}
  return "system";
}

function getSystemTheme(): "light" | "dark" {
  if (typeof globalThis.window === "undefined") return "light";
  return globalThis.window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function resolveTheme(theme: ThemeMode): "light" | "dark" {
  if (theme === "system") {
    return getSystemTheme();
  }
  return theme;
}

function applyTheme(resolvedTheme: "light" | "dark") {
  if (typeof globalThis.window === "undefined") return;
  const root = globalThis.window.document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolvedTheme);
}

function addTransitionClass() {
  if (typeof globalThis.window === "undefined") return;
  const root = globalThis.window.document.documentElement;
  root.classList.add("theme-transitioning");
  setTimeout(() => root.classList.remove("theme-transitioning"), 200);
}

interface ThemeProviderProps {
  readonly children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("dark");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = getStoredTheme();
    setThemeState(stored);
    setResolvedTheme(resolveTheme(stored));
    setMounted(true);
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    globalThis.window?.localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    const resolved = resolveTheme(newTheme);
    setResolvedTheme(resolved);
    addTransitionClass();
    applyTheme(resolved);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    // Apply initial theme immediately to prevent flash
    applyTheme(resolvedTheme);

    // Listen for system theme changes if using system preference
    if (theme === "system") {
      const mediaQuery = globalThis.window?.matchMedia("(prefers-color-scheme: dark)");
      if (!mediaQuery) return;

      const handleChange = () => {
        const newResolved = getSystemTheme();
        setResolvedTheme(newResolved);
        applyTheme(newResolved);
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme, resolvedTheme, mounted]);

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme,
    mounted,
  }), [theme, resolvedTheme, setTheme, mounted]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
