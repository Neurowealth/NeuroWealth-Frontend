"use client";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { ShieldCheck } from "lucide-react";

export function CookieBanner() {
  const { showBanner, acceptAll, rejectAll, openModal } = useCookieConsent();
  if (!showBanner) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-4 sm:px-6"
      style={{
        minHeight: "72px",
        maxHeight: "96px",
        background: "rgba(4, 10, 22, 0.96)",
        borderTop: "1px solid rgba(34, 211, 238, 0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 -4px 40px rgba(0,0,0,0.7)",
      }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <ShieldCheck size={18} style={{ color: "#22d3ee", flexShrink: 0 }} />
        <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", lineHeight: 1.4 }} className="truncate">
          We use cookies to personalise your experience.{" "}
          <button onClick={openModal} style={{ color: "#22d3ee", textDecoration: "underline", textUnderlineOffset: "2px", background: "none", border: "none", cursor: "pointer", padding: 0, fontSize: "inherit" }}>
            Privacy policy
          </button>
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button onClick={openModal}
          style={{ minHeight: "44px", minWidth: "44px", padding: "0 14px", fontSize: "13px", color: "rgba(255,255,255,0.55)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
          Options
        </button>
        <button onClick={rejectAll}
          style={{ minHeight: "44px", minWidth: "44px", padding: "0 14px", fontSize: "13px", color: "rgba(255,255,255,0.55)", background: "transparent", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.55)"; }}>
          Reject
        </button>
        <button onClick={acceptAll}
          style={{ minHeight: "44px", minWidth: "44px", padding: "0 18px", fontSize: "13px", fontWeight: 600, color: "#020917", background: "linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)", border: "none", borderRadius: "8px", cursor: "pointer", whiteSpace: "nowrap" }}
          onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}>
          Accept all
        </button>
      </div>
    </div>
  );
}
