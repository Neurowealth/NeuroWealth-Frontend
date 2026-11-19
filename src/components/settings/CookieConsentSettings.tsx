"use client";
import React from "react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { ShieldCheck, BarChart2, Megaphone, Sparkles, Settings2, RefreshCcw } from "lucide-react";
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  accepted: { label: "All cookies accepted", color: "text-emerald-600 dark:text-emerald-400" },
  rejected: { label: "Non-essential cookies rejected", color: "text-rose-600 dark:text-rose-400" },
  custom:   { label: "Custom preferences saved", color: "text-amber-600 dark:text-amber-400" },
  pending:  { label: "No preference set", color: "text-slate-500 dark:text-white/40" },
};
const PREF_ROWS = [
  { key: "necessary" as const, icon: <ShieldCheck size={15} />, label: "Strictly Necessary" },
  { key: "analytics" as const, icon: <BarChart2 size={15} />, label: "Analytics" },
  { key: "marketing" as const, icon: <Megaphone size={15} />, label: "Marketing" },
  { key: "personalization" as const, icon: <Sparkles size={15} />, label: "Personalization" },
];
export function CookieConsentSettings() {
  const { consentState, openModal, resetConsent } = useCookieConsent();
  const { status, preferences, lastUpdated } = consentState;
  const statusMeta = STATUS_LABELS[status] ?? STATUS_LABELS.pending;
  const formattedDate = lastUpdated ? new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(lastUpdated)) : null;
  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><ShieldCheck className="text-emerald-600 dark:text-[#6EE7C7]" size={16} />Cookie & Privacy Preferences</h3><p className="mt-1 text-xs text-slate-500 dark:text-white/40">Control how NeuroWealth uses cookies on your device.</p></div>
        <span className={`text-xs font-medium ${statusMeta.color} shrink-0`}>{statusMeta.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PREF_ROWS.map(({ key, icon, label }) => { const isOn = preferences[key]; return (
          <div key={key} className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 dark:border-white/[0.07] dark:bg-white/[0.04]">
            <span className={isOn ? "text-emerald-600 dark:text-[#6EE7C7]" : "text-slate-400 dark:text-white/25"}>{icon}</span>
            <span className="flex-1 text-xs text-slate-600 dark:text-white/60">{label}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isOn ? "text-emerald-600 dark:text-[#6EE7C7]" : "text-slate-400 dark:text-white/25"}`}>{isOn ? "On" : "Off"}</span>
          </div>
        ); })}
      </div>
      {formattedDate && <p className="text-xs text-slate-500 dark:text-white/30">Last updated: {formattedDate}</p>}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={openModal} className="flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-medium text-slate-700 transition-all hover:border-slate-500 hover:text-slate-950 dark:border-white/10 dark:text-white/70 dark:hover:border-white/30 dark:hover:text-white"><Settings2 size={14} /> Manage preferences</button>
        <button onClick={resetConsent} className="flex h-11 items-center gap-2 px-4 text-sm font-medium text-slate-500 transition-all hover:text-slate-900 dark:text-white/40 dark:hover:text-white/70"><RefreshCcw size={13} /> Reset</button>
      </div>
    </div>
  );
}
