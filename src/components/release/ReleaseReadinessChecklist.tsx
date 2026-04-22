"use client";

import { useMemo, useState } from "react";
import {
  ClipboardCheck,
  Download,
  FileText,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

type Status = "Not started" | "In review" | "Blocked" | "Passed";

interface ChecklistItem {
  id: string;
  section: "Functional checks" | "Visual checks" | "Known issues";
  check: string;
  detail: string;
  status: Status;
  assignee: string;
}

interface SignOff {
  role: "Product" | "Design" | "Engineering";
  owner: string;
  decision: "Pending" | "Approved" | "Needs follow-up";
  date: string;
}

const initialItems: ChecklistItem[] = [
  {
    id: "auth-onboarding",
    section: "Functional checks",
    check: "Authentication and onboarding",
    detail: "Sign in, wallet connection, and first dashboard load complete without dead ends.",
    status: "In review",
    assignee: "Product QA",
  },
  {
    id: "portfolio-data",
    section: "Functional checks",
    check: "Portfolio data states",
    detail: "Empty, loading, fallback, and populated portfolio states are readable.",
    status: "In review",
    assignee: "Engineering",
  },
  {
    id: "transactions",
    section: "Functional checks",
    check: "Transactions and activity",
    detail: "Activity, transaction history, and audit surfaces handle expected release data.",
    status: "Not started",
    assignee: "QA",
  },
  {
    id: "responsive-layout",
    section: "Visual checks",
    check: "Responsive dashboard layout",
    detail: "Desktop, tablet, and mobile dashboard views preserve hierarchy and controls.",
    status: "Passed",
    assignee: "Design QA",
  },
  {
    id: "tokens",
    section: "Visual checks",
    check: "Issue 3 design tokens",
    detail: "Release page uses established surface, text, spacing, status, and radius tokens.",
    status: "Passed",
    assignee: "Design",
  },
  {
    id: "accessibility",
    section: "Visual checks",
    check: "Accessibility pass",
    detail: "Keyboard flow, landmark structure, focus states, and contrast are checked.",
    status: "In review",
    assignee: "QA",
  },
  {
    id: "api-flags",
    section: "Known issues",
    check: "API integration flags",
    detail: "Document backend or environment dependencies that could affect release readiness.",
    status: "Blocked",
    assignee: "Engineering",
  },
  {
    id: "copy-review",
    section: "Known issues",
    check: "Release copy review",
    detail: "Capture unresolved product copy, support, or documentation gaps.",
    status: "Not started",
    assignee: "Product",
  },
];

const initialSignOffs: SignOff[] = [
  { role: "Product", owner: "", decision: "Pending", date: "" },
  { role: "Design", owner: "", decision: "Pending", date: "" },
  { role: "Engineering", owner: "", decision: "Pending", date: "" },
];

const statusStyles: Record<Status, string> = {
  "Not started": "border-slate-600 bg-slate-800 text-slate-300",
  "In review": "border-sky-500/40 bg-sky-500/10 text-sky-300",
  Blocked: "border-amber-500/40 bg-amber-500/10 text-amber-300",
  Passed: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
};

const decisionStyles: Record<SignOff["decision"], string> = {
  Pending: "border-slate-600 bg-slate-800 text-slate-300",
  Approved: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  "Needs follow-up": "border-amber-500/40 bg-amber-500/10 text-amber-300",
};

const sections: ChecklistItem["section"][] = [
  "Functional checks",
  "Visual checks",
  "Known issues",
];

function buildSummary(items: ChecklistItem[], signOffs: SignOff[]) {
  const grouped = sections
    .map((section) => {
      const rows = items
        .filter((item) => item.section === section)
        .map(
          (item) =>
            `- [${item.status}] ${item.check} - ${item.assignee || "Unassigned"}: ${item.detail}`,
        )
        .join("\n");

      return `## ${section}\n${rows}`;
    })
    .join("\n\n");

  const approvals = signOffs
    .map(
      (signOff) =>
        `- ${signOff.role}: ${signOff.decision} (${signOff.owner || "owner pending"}${signOff.date ? `, ${signOff.date}` : ""})`,
    )
    .join("\n");

  return `# Release readiness summary\n\n${grouped}\n\n## Sign-offs\n${approvals}`;
}

export default function ReleaseReadinessChecklist() {
  const [items, setItems] = useState(initialItems);
  const [signOffs, setSignOffs] = useState(initialSignOffs);
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => buildSummary(items, signOffs), [items, signOffs]);
  const totalChecks = items.length;
  const passedChecks = items.filter((item) => item.status === "Passed").length;
  const blockedChecks = items.filter((item) => item.status === "Blocked").length;

  function updateItem(id: string, patch: Partial<ChecklistItem>) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item)),
    );
  }

  function updateSignOff(role: SignOff["role"], patch: Partial<SignOff>) {
    setSignOffs((current) =>
      current.map((signOff) =>
        signOff.role === role ? { ...signOff, ...patch } : signOff,
      ),
    );
  }

  async function copySummary() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function downloadSummary() {
    const blob = new Blob([summary], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "release-readiness-summary.md";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="rounded-lg border border-surface-border bg-surface p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-300">
              <ClipboardCheck className="h-3.5 w-3.5" aria-hidden="true" />
              QA/UAT release gate
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              Release readiness checklist
            </h1>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Track functional checks, visual QA, unresolved issues, and final
              product/design/engineering sign-off before a NeuroWealth release.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 sm:min-w-[360px]">
            <div className="rounded-lg border border-surface-border bg-app-bg p-3">
              <p className="text-xs text-text-muted">Total</p>
              <p className="mt-1 text-2xl font-bold text-text-primary">{totalChecks}</p>
            </div>
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <p className="text-xs text-emerald-300">Passed</p>
              <p className="mt-1 text-2xl font-bold text-emerald-200">{passedChecks}</p>
            </div>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <p className="text-xs text-amber-300">Blocked</p>
              <p className="mt-1 text-2xl font-bold text-amber-200">{blockedChecks}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-6">
          {sections.map((section) => (
            <section
              key={section}
              className="rounded-lg border border-surface-border bg-surface shadow-card"
              aria-labelledby={`${section.replace(/\s+/g, "-").toLowerCase()}-heading`}
            >
              <div className="flex items-center gap-3 border-b border-surface-border px-5 py-4">
                {section === "Functional checks" && (
                  <ShieldCheck className="h-5 w-5 text-sky-300" aria-hidden="true" />
                )}
                {section === "Visual checks" && (
                  <Smartphone className="h-5 w-5 text-emerald-300" aria-hidden="true" />
                )}
                {section === "Known issues" && (
                  <FileText className="h-5 w-5 text-amber-300" aria-hidden="true" />
                )}
                <h2
                  id={`${section.replace(/\s+/g, "-").toLowerCase()}-heading`}
                  className="text-sm font-semibold text-text-primary"
                >
                  {section}
                </h2>
              </div>

              <div className="divide-y divide-surface-border">
                {items
                  .filter((item) => item.section === section)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_180px_190px]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {item.check}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-text-secondary">
                          {item.detail}
                        </p>
                      </div>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-text-muted">Status</span>
                        <select
                          value={item.status}
                          onChange={(event) =>
                            updateItem(item.id, { status: event.target.value as Status })
                          }
                          className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold outline-none transition-colors ${statusStyles[item.status]}`}
                        >
                          {Object.keys(statusStyles).map((status) => (
                            <option key={status}>{status}</option>
                          ))}
                        </select>
                      </label>

                      <label className="space-y-1">
                        <span className="text-xs font-medium text-text-muted">Assignee</span>
                        <input
                          value={item.assignee}
                          onChange={(event) =>
                            updateItem(item.id, { assignee: event.target.value })
                          }
                          className="w-full rounded-lg border border-surface-border bg-app-bg px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-primary"
                          placeholder="Owner"
                        />
                      </label>
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-surface-border bg-surface p-5 shadow-card">
            <h2 className="text-sm font-semibold text-text-primary">Sign-off flow</h2>
            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Product confirms scope, design approves visual quality, and engineering
              validates implementation readiness before release.
            </p>

            <div className="mt-4 space-y-4">
              {signOffs.map((signOff) => (
                <div key={signOff.role} className="rounded-lg border border-surface-border bg-app-bg p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-text-primary">{signOff.role}</p>
                    <select
                      value={signOff.decision}
                      onChange={(event) =>
                        updateSignOff(signOff.role, {
                          decision: event.target.value as SignOff["decision"],
                        })
                      }
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none ${decisionStyles[signOff.decision]}`}
                    >
                      {Object.keys(decisionStyles).map((decision) => (
                        <option key={decision}>{decision}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <input
                      value={signOff.owner}
                      onChange={(event) =>
                        updateSignOff(signOff.role, { owner: event.target.value })
                      }
                      className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted focus:border-primary"
                      placeholder={`${signOff.role} owner`}
                    />
                    <input
                      type="date"
                      value={signOff.date}
                      onChange={(event) =>
                        updateSignOff(signOff.role, { date: event.target.value })
                      }
                      className="rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm text-text-primary outline-none focus:border-primary"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-surface-border bg-surface p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold text-text-primary">
                  Release notes export
                </h2>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Generated from the current checklist and sign-off state.
                </p>
              </div>
            </div>

            <textarea
              readOnly
              value={summary}
              className="mt-4 min-h-[260px] w-full resize-y rounded-lg border border-surface-border bg-app-bg p-3 font-mono text-xs leading-5 text-slate-300 outline-none"
              aria-label="Release notes summary"
            />

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <button
                type="button"
                onClick={copySummary}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {copied ? "Copied" : "Copy summary"}
              </button>
              <button
                type="button"
                onClick={downloadSummary}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary/60 px-4 py-2.5 text-sm font-semibold text-sky-300 transition-colors hover:bg-primary/10"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Download
              </button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
