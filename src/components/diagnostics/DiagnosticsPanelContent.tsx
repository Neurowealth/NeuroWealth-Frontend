"use client";

import React, { useEffect, useState, useRef } from "react";
import { useDiagnostics } from "@/hooks/useDiagnostics";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { LogViewer } from "./LogViewer";
import { EventMonitor } from "./EventMonitor";

const DIAG_TABS = ["logs", "events", "env"] as const;
type DiagnosticsTab = (typeof DIAG_TABS)[number];

export interface DiagnosticsPanelContentProps {
  onClose: () => void;
}

export function DiagnosticsPanelContent({ onClose }: DiagnosticsPanelContentProps) {
  const [activeTab, setActiveTab] = useState<DiagnosticsTab>("logs");
  const tabRefs = useRef<Record<DiagnosticsTab, HTMLButtonElement | null>>({
    logs: null,
    events: null,
    env: null,
  });
  const { logs, events, clearLogs, clearEvents, env } = useDiagnostics();
  const panelRef = useRef<HTMLDivElement>(null);
  useFocusTrap(panelRef, true);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const handleTabKeyDown = (event: React.KeyboardEvent, tab: DiagnosticsTab) => {
    const index = DIAG_TABS.indexOf(tab);
    const total = DIAG_TABS.length;
    let nextIndex: number | null = null;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (index + 1) % total;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (index - 1 + total) % total;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = total - 1;
    }
    if (nextIndex === null) return;
    event.preventDefault();
    const nextTab = DIAG_TABS[nextIndex];
    setActiveTab(nextTab);
    tabRefs.current[nextTab]?.focus();
  };

  return (
    <div className="fixed bottom-4 right-4 z-dev-tool">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="diagnostics-panel-title"
        className="w-[calc(100vw-2rem)] max-w-[400px] h-[500px] max-h-[calc(100vh-2rem)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200"
      >
        <div className="p-3 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
          <h3 id="diagnostics-panel-title" className="text-xs font-bold text-white uppercase tracking-widest">
            Diagnostics
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-500 hover:text-white rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400"
            aria-label="Close diagnostics"
          >
            ✕
          </button>
        </div>

        <div role="tablist" aria-label="Diagnostics panels" className="flex border-b border-slate-700 bg-slate-800/30">
          {DIAG_TABS.map((tab) => (
            <button
              key={tab}
              role="tab"
              id={`diag-tab-${tab}`}
              aria-selected={activeTab === tab}
              aria-controls={`diag-panel-${tab}`}
              tabIndex={activeTab === tab ? 0 : -1}
              ref={(el) => {
                tabRefs.current[tab] = el;
              }}
              onClick={() => setActiveTab(tab)}
              onKeyDown={(event) => handleTabKeyDown(event, tab)}
              className={`flex-1 py-2 text-[10px] uppercase font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-400 ${
                activeTab === tab ? "text-brand-400 border-b-2 border-brand-400" : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div
          id="diag-panel-logs"
          role="tabpanel"
          aria-labelledby="diag-tab-logs"
          hidden={activeTab !== "logs"}
          tabIndex={0}
          className="flex-1 overflow-hidden p-3"
        >
          <LogViewer logs={logs} onClear={clearLogs} />
        </div>
        <div
          id="diag-panel-events"
          role="tabpanel"
          aria-labelledby="diag-tab-events"
          hidden={activeTab !== "events"}
          tabIndex={0}
          className="flex-1 overflow-hidden p-3"
        >
          <EventMonitor events={events} onClear={clearEvents} />
        </div>
        <div
          id="diag-panel-env"
          role="tabpanel"
          aria-labelledby="diag-tab-env"
          hidden={activeTab !== "env"}
          tabIndex={0}
          className="flex-1 overflow-hidden p-3"
        >
          <div className="bg-slate-800 rounded-lg p-3 text-[10px] font-mono space-y-2 border border-slate-700">
            <div className="flex justify-between"><span className="text-slate-500">NODE_ENV:</span><span className="text-brand-400">{env.nodeEnv}</span></div>
            <div className="flex flex-col gap-1">
              <span className="text-slate-500">USER_AGENT:</span>
              <span className="text-slate-300 break-all">{env.userAgent}</span>
            </div>
            <div className="pt-4 border-t border-slate-700">
              <button
                onClick={() => { throw new Error("This is a test diagnostic error!"); }}
                className="w-full py-2 bg-red-900/30 text-red-400 border border-red-500/30 rounded hover:bg-red-900/50 transition-colors"
              >
                Trigger Test Error
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
