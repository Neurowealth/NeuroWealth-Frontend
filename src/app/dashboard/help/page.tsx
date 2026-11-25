"use client";

import { useRef, useState } from "react";
import { HelpCircle, MessageSquare, AlertTriangle } from "lucide-react";
import FAQSection from "@/components/help/FAQSection";
import SupportForm from "@/components/help/SupportForm";
import TransactionGuidance from "@/components/help/TransactionGuidance";

export const dynamic = "force-dynamic";

const TABS = [
  { id: "faq", label: "FAQs", icon: HelpCircle },
  { id: "transactions", label: "Transaction Help", icon: AlertTriangle },
  { id: "contact", label: "Contact Support", icon: MessageSquare },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabId>("faq");

  const tabRefs = useRef<Record<TabId, HTMLButtonElement | null>>({
    faq: null,
    transactions: null,
    contact: null,
  });

  return (
    <div className="px-6 py-8 space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-text-primary">Help Center</h1>
        <p className="mt-1 text-sm text-text-secondary max-w-[420px]">
          Find answers to common questions, troubleshoot transactions, or reach our support team.
        </p>
      </div>

      {/* Tab navigation */}
      <div
        role="tablist"
        aria-label="Help sections"
        className="flex gap-1 rounded-xl border border-slate-700/50 bg-slate-950/35 p-1 w-fit"
      >
        {TABS.map(({ id, label, icon: Icon }, index) => (
          <button
            key={id}
            role="tab"
            id={`help-tab-${id}`}
            aria-selected={activeTab === id}
            aria-controls={`help-panel-${id}`}
            tabIndex={activeTab === id ? 0 : -1}
            ref={(el) => {
              tabRefs.current[id] = el;
            }}
            onClick={() => setActiveTab(id)}
            onKeyDown={(event) => {
              const total = TABS.length;
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
              const nextTab = TABS[nextIndex];
              setActiveTab(nextTab.id);
              tabRefs.current[nextTab.id]?.focus();
            }}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/70 ${
              activeTab === id
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <div
        id="help-panel-faq"
        role="tabpanel"
        aria-labelledby="help-tab-faq"
        hidden={activeTab !== "faq"}
        tabIndex={0}
      >
        <FAQSection />
      </div>

      <div
        id="help-panel-transactions"
        role="tabpanel"
        aria-labelledby="help-tab-transactions"
        hidden={activeTab !== "transactions"}
        tabIndex={0}
      >
        <TransactionGuidance onContactSupport={() => setActiveTab("contact")} />
      </div>

      <div
        id="help-panel-contact"
        role="tabpanel"
        aria-labelledby="help-tab-contact"
        hidden={activeTab !== "contact"}
        tabIndex={0}
      >
        <SupportForm />
      </div>
    </div>
  );
}
