"use client";
import { useState, useEffect } from "react";
import { useCookieConsent, CookiePreferences } from "@/contexts/CookieConsentContext";
import { X, ShieldCheck, BarChart2, Megaphone, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

const CYAN = "#22d3ee";
const CYAN_DIM = "rgba(34,211,238,0.6)";
const BORDER_SUBTLE = "rgba(255,255,255,0.07)";

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
  useEffect(() => { if (showModal) setLocalPrefs(consentState.preferences); }, [showModal, consentState.preferences]);
  if (!showModal) return null;
  const toggle = (key: keyof CookiePreferences) => { if (key === "necessary") return; setLocalPrefs((p) => ({ ...p, [key]: !p[key] })); };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Privacy preferences">
      <div onClick={closeModal} style={{ position: "absolute", inset: 0, background: "rgba(2, 6, 18, 0.8)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }} />
      <div className="relative w-full sm:max-w-lg flex flex-col" style={{ background: "rgba(4, 10, 22, 0.98)", border: "1px solid rgba(34,211,238,0.15)", borderRadius: "16px", boxShadow: "0 0 0 1px rgba(34,211,238,0.05), 0 24px 64px rgba(0,0,0,0.8)", maxHeight: "90vh", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px", borderBottom: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <ShieldCheck size={20} style={{ color: CYAN }} />
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 600, color: "#fff", margin: 0 }}>Privacy Preferences</h2>
              <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.38)", margin: "2px 0 0" }}>Manage how NeuroWealth uses your data</p>
            </div>
          </div>
          <button onClick={closeModal} aria-label="Close" style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "rgba(255,255,255,0.35)", cursor: "pointer", borderRadius: "8px" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "transparent"; }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ overflowY: "auto", flex: 1, padding: "16px 20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.12)", borderRadius: "10px", padding: "10px 14px", marginBottom: "4px" }}>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.45)", lineHeight: 1.6, margin: 0 }}>We respect your privacy. Strictly necessary cookies are always active.{" "}<a href="/privacy" style={{ color: CYAN, textDecoration: "underline", textUnderlineOffset: "2px" }}>Read our full Privacy Policy →</a></p>
          </div>
          {COOKIE_GROUPS.map((g) => {
            const isOn = localPrefs[g.key];
            const isEx = expanded === g.key;
            return (
              <div key={g.key} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${BORDER_SUBTLE}`, borderRadius: "10px", overflow: "hidden" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px" }}>
                  <button onClick={() => setExpanded(isEx ? null : g.key)} style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", color: "ba(255,255,255,0.35)", cursor: "pointer", borderRadius: "6px", flexShrink: 0 }}>
                    {isEx ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, cursor: "pointer" }} onClick={() => setExpanded(isEx ? null : g.key)}>
                    <span style={{ color: CYAN_DIM }}>{g.icon}</span>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 500, color: "rgba(255,255,255,0.88)", margin: 0 }}>{g.label}</p>
                      {g.required && <span style={{ fontSize: "9px", color: CYAN_DIM, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>Always active</span>}
                    </div>
                  </div>
                  <button role="switch" aria-checked={isOn} aria-label={`Toggle ${g.label}`} onClick={() => toggle(g.key)} disabled={g.required} style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent", border: "none", cursor: g.required ? "not-allowed" : "pointer", flexShrink: 0 }}>
                    <div style={{ width: "40px", height: "22px", borderRadius: "11px", position: "relative", transition: "background 0.2s", background: isOn ? CYAN : g.required ? "rgba(34,211,238,0.25)" : "rgba(255,255,255,0.1)" }}>
                      <span style={{ position: "absolute", top: "3px", left: "3px", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transition: "transform 0.2s", transform: isOn ? "translateX(18px)" : "translateX(0)", display: "block" }} />
                    </div>
                  </button>
                </div>
                {isEx && <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${BORDER_SUBTLE}` }}><p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.6, paddingTop: "12px", margin: 0 }}>{g.description}</p></div>}
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: "8px", padding: "14px 20px", borderTop: `1px solid ${BORDER_SUBTLE}`, flexShrink: 0 }}>
          <button onClick={rejectAll} style={{ flex: 1, height: "44px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.45)" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.28)"; e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}>Reject all</button>
          <button onClick={() => savePreferences(localPrefs)} style={{ flex: 1, height: "44px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, cursor: "pointer", background: "rgba(34,211,238,0.1)", border: "1px solid rgba(34,211,238,0.3)", color: CYAN }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(34,211,238,0.18)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(34,211,238,0.1)"; }}>Save preferences</button>
          <button onClick={acceptAll} style={{ flex: 1, height: "44px", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer", background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", border: "none", color: "#020917" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>Accept all</button>
        </div>
      </div>
    </div>
  );
}
