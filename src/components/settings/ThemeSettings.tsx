"use client";

import { useTheme } from "@/contexts/ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import type { ThemeMode } from "@/contexts/ThemeProvider";
import { useI18n } from "@/contexts/I18nContext";

export function ThemeSettings() {
  const { theme, setTheme, mounted } = useTheme();
  const { messages } = useI18n();
  const t = messages.settings;

  const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: "light", label: t.preferences.appearance.light, icon: Sun },
    { value: "dark", label: t.preferences.appearance.dark, icon: Moon },
    { value: "system", label: t.preferences.appearance.system, icon: Monitor },
  ];

  if (!mounted) {
    return (
      <div className="flex items-center gap-1.5 rounded-xl bg-surface-elevated p-1" role="radiogroup" aria-label={t.themeSelector.ariaLabel}>
        <div className="min-h-[44px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 rounded-xl bg-surface-elevated p-1" role="radiogroup" aria-label={t.themeSelector.ariaLabel}>
      {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 min-h-[44px] ${
            theme === value
              ? "bg-sky-500 text-white shadow-sm"
              : "text-text-muted hover:text-text-primary hover:bg-white/5"
          }`}
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
