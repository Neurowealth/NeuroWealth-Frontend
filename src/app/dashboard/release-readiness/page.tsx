"use client";

import { useMemo, useState } from "react";
import { CheckCheck, ClipboardList, Download, Smartphone } from "lucide-react";
import { Button, Card, InlineBanner } from "@/components/ui";

type ChecklistStatus = "Ready" | "Needs Work" | "Blocked";

interface ChecklistItem {
  id: string;
  section: "Functional" | "Visual" | "Known Issues";
  check: string;
  assignee: string;
  status: ChecklistStatus;
  note: string;
}

const INITIAL_ITEMS: ChecklistItem[] = [
  {
    id: "qa-auth",
    section: "Functional",
    check: "Auth flow, protected routes, and wallet reconnect paths",
    assignee: "QA Lead",
    status: "Ready",
    note: "Smoke tested across sign in, sign up, and session timeout flows.",
  },
  {
    id: "qa-dashboard",
    section: "Functional",
    check: "Dashboard data states, notifications, and settings persistence",
    assignee: "Frontend Eng",
    status: "Needs Work",
    note: "Awaiting a final pass on empty-state messaging and fallback copy.",
  },
  {
    id: "design-mobile",
    section: "Visual",
    check: "Desktop and mobile parity for key dashboard views",
    assignee: "Design",
    status: "Ready",
    note: "Typography, spacing, and sticky actions validated on narrow screens.",
  },
  {
    id: "design-brand",
    section: "Visual",
    check: "Brand color balance, focus rings, and alert contrast",
    assignee: "Design",
    status: "Needs Work",
    note: "One warning banner needs stronger contrast on light backgrounds.",
  },
  {
    id: "known-wallet",
    section: "Known Issues",
    check: "Freighter connection fallback in sandbox mode",
    assignee: "Product",
    status: "Blocked",
    note: "Blocked until wallet mock behavior is aligned with QA expectations.",
  },
];

const statusClasses: Record<ChecklistStatus, string> = {
  Ready: "bg-emerald-500/12 text-emerald-200 border-emerald-400/25",
  "Needs Work": "bg-amber-500/12 text-amber-200 border-amber-400/25",
  Blocked: "bg-red-500/12 text-red-200 border-red-400/25",
};

export default function ReleaseReadinessPage() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [productSignoff, setProductSignoff] = useState("Maya - pending final review");
  const [designSignoff, setDesignSignoff] = useState("Lena - reviewed mobile parity");
  const [engineeringSignoff, setEngineeringSignoff] = useState("Victor - final CI verification pending");

  const grouped = useMemo(
    () => ({
      Functional: items.filter((item) => item.section === "Functional"),
      Visual: items.filter((item) => item.section === "Visual"),
      "Known Issues": items.filter((item) => item.section === "Known Issues"),
    }),
    [items],
  );

  const summary = useMemo(() => {
    const ready = items.filter((item) => item.status === "Ready").length;
    const needsWork = items.filter((item) => item.status === "Needs Work").length;
    const blocked = items.filter((item) => item.status === "Blocked").length;

    return {
      ready,
      needsWork,
      blocked,
      text: [
        "NeuroWealth frontend release checklist",
        `Ready: ${ready}`,
        `Needs Work: ${needsWork}`,
        `Blocked: ${blocked}`,
        "",
        ...items.map(
          (item) =>
            `- [${item.status}] ${item.section}: ${item.check} (${item.assignee}) - ${item.note}`,
        ),
        "",
        `Product sign-off: ${productSignoff}`,
        `Design sign-off: ${designSignoff}`,
        `Engineering sign-off: ${engineeringSignoff}`,
      ].join("\n"),
    };
  }, [engineeringSignoff, items, productSignoff, designSignoff]);

  const updateItem = (id: string, next: Partial<ChecklistItem>) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...next } : item)),
    );
  };

  return (
    <main className="space-y-6 px-6 py-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          Issue #60
        </p>
        <h1 className="text-3xl font-bold text-slate-50">
          Release readiness checklist
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          Internal QA, UAT, and sign-off tracking for the frontend release
          cycle, including export-friendly notes for release updates.
        </p>
      </div>

      <InlineBanner
        variant={summary.blocked > 0 ? "warning" : "success"}
        eyebrow="Release Review"
        title={
          summary.blocked > 0
            ? "A blocker remains before release sign-off"
            : "The checklist is ready for sign-off"
        }
      >
        Functional checks, visual checks, and known issues stay readable on both
        desktop and mobile while keeping a single exportable summary.
      </InlineBanner>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-2 text-emerald-300">
              <CheckCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Ready</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{summary.ready}</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-300">
              <ClipboardList className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Needs Work</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{summary.needsWork}</p>
            </div>
          </div>
        </Card>
        <Card className="border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm text-slate-400">Blocked</p>
              <p className="mt-1 text-2xl font-bold text-slate-100">{summary.blocked}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          {Object.entries(grouped).map(([section, sectionItems]) => (
            <Card key={section} className="space-y-4 border-slate-700/50 bg-dark-800/70">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{section}</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Review status, assignee, and notes for this release slice.
                </p>
              </div>

              <div className="space-y-3">
                {sectionItems.map((item) => (
                  <div
                    className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4"
                    key={item.id}
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-slate-100">{item.check}</p>
                        <input
                          className="w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none"
                          onChange={(event) =>
                            updateItem(item.id, { assignee: event.target.value })
                          }
                          value={item.assignee}
                        />
                      </div>

                      <select
                        className={`rounded-xl border px-3 py-2 text-sm font-semibold ${statusClasses[item.status]}`}
                        onChange={(event) =>
                          updateItem(item.id, {
                            status: event.target.value as ChecklistStatus,
                          })
                        }
                        value={item.status}
                      >
                        <option value="Ready">Ready</option>
                        <option value="Needs Work">Needs Work</option>
                        <option value="Blocked">Blocked</option>
                      </select>
                    </div>

                    <textarea
                      className="mt-3 min-h-[96px] w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none"
                      onChange={(event) => updateItem(item.id, { note: event.target.value })}
                      value={item.note}
                    />
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="space-y-4 border-slate-700/50 bg-dark-800/70">
            <h2 className="text-lg font-semibold text-slate-100">Sign-off owners</h2>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Product</span>
              <input
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-slate-200 outline-none"
                onChange={(event) => setProductSignoff(event.target.value)}
                value={productSignoff}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Design</span>
              <input
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-slate-200 outline-none"
                onChange={(event) => setDesignSignoff(event.target.value)}
                value={designSignoff}
              />
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              <span>Engineering</span>
              <input
                className="w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-slate-200 outline-none"
                onChange={(event) => setEngineeringSignoff(event.target.value)}
                value={engineeringSignoff}
              />
            </label>
          </Card>

          <Card className="space-y-4 border-slate-700/50 bg-dark-800/70">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Export summary</h2>
                <p className="mt-1 text-sm text-slate-400">
                  Copy this directly into release notes or a handoff ticket.
                </p>
              </div>
            </div>
            <textarea
              className="min-h-[320px] w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-3 py-2 text-sm text-slate-200 outline-none"
              readOnly
              value={summary.text}
            />
            <Button
              className="justify-center"
              onClick={() => navigator.clipboard.writeText(summary.text)}
            >
              Copy Release Summary
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
