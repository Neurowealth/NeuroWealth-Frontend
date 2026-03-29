"use client";

import { ChangeEvent } from "react";
import { useI18n } from "@/contexts";

export function LocaleSwitcher() {
  const { locale, setLocale, messages } = useI18n();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setLocale(event.target.value as "en" | "fr");
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="locale-switcher" className="sr-only">
        {messages.locale.switcherLabel}
      </label>
      <span className="hidden text-xs font-semibold uppercase tracking-wide text-slate-400 lg:inline">
        {messages.locale.label}
      </span>
      <select
        id="locale-switcher"
        value={locale}
        onChange={handleChange}
        className="rounded-md border border-slate-700 bg-dark-800 px-2.5 py-1.5 text-xs text-slate-200 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-500/30"
        aria-label={messages.locale.switcherLabel}
      >
        <option value="en">{messages.locale.options.en}</option>
        <option value="fr">{messages.locale.options.fr}</option>
      </select>
    </div>
  );
}
