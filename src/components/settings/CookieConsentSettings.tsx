"use client";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { ShieldCheck, BarChart2, Megaphone, Sparkles, Settings2, RefreshCcw } from "lucide-react";
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  accepted: { label: "All cookies accepted", color: "text-emerald-400" },
  rejected: { label: "Non-essential cookies rejected", color: "text-rose-400" },
  custom:   { label: "Custom preferences saved", color: "text-amber-400" },
  pending:  { label: "No preference set", color: "text-white/40" },
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
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div><h3 className="text-white font-semibold text-sm flex items-center gap-2"><ShieldCheck className="text-[#6EE7C7]" size={16} />Cookie & Privacy Preferences</h3><p className="text-white/40 text-xs mt-1">Control how NeuroWealth uses cookies on your device.</p></div>
        <span className={`text-xs font-medium ${statusMeta.color} shrink-0`}>{statusMeta.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {PREF_ROWS.map(({ key, icon, label }) => { const isOn = preferences[key]; return (
          <div key={key} className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] border border-white/[0.07] px-3 py-2.5">
            <span className={isOn ? "text-[#6EE7C7]" : "text-white/25"}>{icon}</span>
            <span className="text-xs text-white/60 flex-1">{label}</span>
            <span className={`text-[10px] font-semibold uppercase tracking-wide ${isOn ? "text-[#6EE7C7]" : "text-white/25"}`}>{isOn ? "On" : "Off"}</span>
          </div>
        ); })}
      </div>
      {formattedDate && <p className="text-xs text-white/30">Last updated: {formattedDate}</p>}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={openModal} style={{ minHeight: "44px" }} className="flex items-center gap-2 px-4 text-sm font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/30 rounded-xl transition-all"><Settings2 size={14} /> Manage preferences</button>
        <button onClick={resetConsent} style={{ minHeight: "44px" }} className="flex items-center gap-2 px-4 text-sm font-medium text-white/40 hover:text-white/70 transition-all"><RefreshCcw size={13} /> Reset</button>
      </div>
    </div>
  );
}
