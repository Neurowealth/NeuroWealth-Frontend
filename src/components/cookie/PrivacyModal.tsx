"use client";
import { useState, useEffect, useRef } from "react";
import { useCookieConsent, CookiePreferences } from "@/contexts/CookieConsentContext";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { X, ShieldCheck, BarChart2, Megaphone, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const COOKIE_GROUPS = [
  { key: "necessary" as keyof CookiePreferences, icon: <ShieldCheck size={16} />, label: "Strictly Necessary", description: "Essential for the website to function. Includes session management, security tokens, and load balancing.", required: true },
  { key: "analytics" as keyof CookiePreferences, icon: <BarChart2 size={16} />, label: "Analytics", description: "Helps us understand how visitors interact with NeuroWealth via anonymised usage data. No personal info stored." },
  { key: "marketing" as keyof CookiePreferences, icon: <Megaphone size={16} />, label: "Marketing", description: "Used to deliver relevant ads and track campaign effectiveness. You can opt out at any time." },
  { key: "personalization" as keyof CookiePreferences, icon: <Sparkles size={16} />, label: "Personalization", description: "Tailors content and AI-driven financial insights to your goals and preferences." },
];

export function PrivacyModal() {
  const { showModal, closeModal, consentState, acceptAll, rejectAll, savePreferences } = useCookieConsent();
  const [localPrefs, setLocalPrefs] = useState<CookiePreferences>(consentState.preferences);
  const [expanded, setExpanded] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  useFocusTrap(containerRef, showModal);

  useEffect(() => { if (showModal) setLocalPrefs(consentState.preferences); }, [showModal, consentState.preferences]);

  // Remember the trigger button and restore focus to it when the modal closes.
  useEffect(() => {
    if (showModal) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [showModal]);

  // Escape closes the dialog.
  useEffect(() => {
    if (!showModal) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [showModal, closeModal]);

  if (!showModal) return null;
  const toggle = (key: keyof CookiePreferences) => { if (key === "necessary") return; setLocalPrefs((p) => ({ ...p, [key]: !p[key] })); };

  return (
    <div ref={containerRef} className="fixed inset-0 z-modal flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Privacy preferences">
      <div onClick={closeModal} className="absolute inset-0 bg-slate-900/60 backdrop-blur-lg dark:bg-slate-950/80" />
      <div className="relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl border border-cyan-600/20 bg-white shadow-2xl shadow-slate-900/30 sm:max-w-lg dark:border-cyan-300/15 dark:bg-slate-950 dark:shadow-black/80">
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-[18px] dark:border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={20} className="text-cyan-600 dark:text-cyan-300" />
            <div>
              <h2 className="m-0 text-[15px] font-semibold text-slate-900 dark:text-white">Privacy Preferences</h2>
              <p className="mb-0 mt-0.5 text-[11px] text-slate-500 dark:text-white/40">Manage how NeuroWealth uses your data</p>
            </div>
          </div>
          <button onClick={closeModal} aria-label="Close" className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg border-0 bg-transparent text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white">
            <X size={16} />
          </button>
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-5 py-4">
          <div className="mb-1 rounded-[10px] border border-cyan-600/20 bg-cyan-50 px-3.5 py-2.5 dark:border-cyan-300/15 dark:bg-cyan-300/[0.05]">
            <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-white/50">We respect your privacy. Strictly necessary cookies are always active.{" "}<a href="/privacy" className="text-cyan-700 underline underline-offset-2 dark:text-cyan-300">Read our full Privacy Policy →</a></p>
          </div>
          {COOKIE_GROUPS.map((g) => {
            const isOn = localPrefs[g.key];
            const isEx = expanded === g.key;
            return (
              <div key={g.key} className="overflow-hidden rounded-[10px] border border-slate-200 bg-slate-50 dark:border-white/[0.07] dark:bg-white/[0.025]">
                <div className="flex items-center gap-2 px-3.5 py-2">
                  <button onClick={() => setExpanded(isEx ? null : g.key)} className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 dark:text-white/40 dark:hover:bg-white/[0.06] dark:hover:text-white">
                    {isEx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div className="flex flex-1 cursor-pointer items-center gap-2.5" onClick={() => setExpanded(isEx ? null : g.key)}>
                    <span className="text-cyan-600 dark:text-cyan-300/60">{g.icon}</span>
                    <div>
                      <p className="m-0 text-[13px] font-medium text-slate-800 dark:text-white/90">{g.label}</p>
                      {g.required && <span className="text-[9px] font-semibold uppercase tracking-[0.07em] text-cyan-700 dark:text-cyan-300/60">Always active</span>}
                    </div>
                  </div>
                  <button role="switch" aria-checked={isOn} aria-label={`Toggle ${g.label}`} onClick={() => toggle(g.key)} disabled={g.required} className="flex h-11 w-11 shrink-0 items-center justify-center border-0 bg-transparent disabled:cursor-not-allowed enabled:cursor-pointer">
                    <div className={`relative h-[22px] w-10 rounded-[11px] transition-colors ${isOn ? "bg-cyan-500" : g.required ? "bg-cyan-600/25 dark:bg-cyan-300/25" : "bg-slate-300 dark:bg-white/10"}`}>
                      <span className={`absolute left-[3px] top-[3px] block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isOn ? "translate-x-[18px]" : "translate-x-0"}`} />
                    </div>
                  </button>
                </div>
                {isEx && <div className="border-t border-slate-200 px-3.5 pb-3.5 dark:border-white/[0.07]"><p className="m-0 pt-3 text-xs leading-relaxed text-slate-600 dark:text-white/40">{g.description}</p></div>}
              </div>
            );
          })}
        </div>
        <div className="flex shrink-0 gap-2 border-t border-slate-200 px-5 py-3.5 dark:border-white/[0.07]">
          <button onClick={rejectAll} className="h-11 flex-1 cursor-pointer rounded-[10px] border border-slate-300 bg-transparent text-[13px] font-medium text-slate-600 transition-colors hover:border-slate-500 hover:text-slate-900 dark:border-white/15 dark:text-white/50 dark:hover:border-white/30 dark:hover:text-white/80">Reject all</button>
          <button onClick={() => savePreferences(localPrefs)} className="h-11 flex-1 cursor-pointer rounded-[10px] border border-cyan-600/30 bg-cyan-50 text-[13px] font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-300/30 dark:bg-cyan-300/10 dark:text-cyan-300 dark:hover:bg-cyan-300/[0.18]">Save Preferences</button>
          <button onClick={acceptAll} className="h-11 flex-1 cursor-pointer rounded-[10px] border-0 bg-gradient-to-br from-cyan-400 to-cyan-500 text-[13px] font-semibold text-slate-950 transition-opacity hover:opacity-[0.85]">Accept all</button>
        </div>
      </div>
    </div>
  );
}
