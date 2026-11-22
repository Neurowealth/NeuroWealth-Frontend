"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/contexts";
import { canAccessDiagnostics } from "./diagnostics-config";

const DiagnosticsPanelContent = dynamic(
  () => import("./DiagnosticsPanelContent").then((mod) => mod.DiagnosticsPanelContent),
  { ssr: false }
);

export function DiagnosticsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, loading } = useAuth();

  if (loading || !canAccessDiagnostics(user)) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-dev-tool">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-400 p-2 rounded-full border border-slate-600 shadow-2xl transition-all"
          title="Open Diagnostics"
          aria-expanded={false}
          aria-haspopup="dialog"
        >
          <span className="text-lg">🛠️</span>
        </button>
      ) : (
        <DiagnosticsPanelContent onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}
