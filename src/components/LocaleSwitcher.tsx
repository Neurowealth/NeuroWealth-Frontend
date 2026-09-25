"use client";

import { ChangeEvent, useCallback } from "react";
import { useI18n } from "@/contexts";

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as "en" | "fr");
  }, [setLocale]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLSelectElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const select = event.currentTarget;
      const currentIndex = select.selectedIndex;
      const nextIndex = currentIndex === select.options.length - 1 ? 0 : currentIndex + 1;
      select.selectedIndex = nextIndex;
      setLocale(select.options[nextIndex].value as "en" | "fr");
    }
  }, [setLocale]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-switcher" className="sr-only">
        {messages.locale.switcherLabel}
      </label>
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-text-muted lg:inline">
        {messages.locale.label}
      </span>
      <select
        id="locale-switcher"
        value={locale}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className="min-w-[100px] rounded-lg border border-surface-border bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary outline-none transition duration-150 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
        aria-label={messages.locale.switcherLabel}
      >
        <option value="en">{messages.locale.options.en}</option>
        <option value="fr">{messages.locale.options.fr}</option>
      </select>
    </div>
  );
}
