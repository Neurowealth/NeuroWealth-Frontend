"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  ReleaseChecklist, 
  ChecklistItem, 
  ChecklistStatus, 
  SignOff, 
  KnownIssue 
} from "@/lib/release-checklist-types";
import {
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Download,
  Plus,
  Trash2,
  Edit2,
  Save,
  type LucideIcon,
} from "lucide-react";

const statusConfig: Record<ChecklistStatus, { label: string; color: string; icon: LucideIcon }> = {
  pending: { label: "Pending", color: "bg-slate-500/20 text-slate-300 border-slate-500/30", icon: Clock },
  "in-progress": { label: "In Progress", color: "bg-sky-500/20 text-sky-300 border-sky-500/30", icon: Clock },
  completed: { label: "Completed", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30", icon: CheckCircle2 },
  blocked: { label: "Blocked", color: "bg-red-500/20 text-red-300 border-red-500/30", icon: XCircle },
  skipped: { label: "Skipped", color: "bg-amber-500/20 text-amber-300 border-amber-500/30", icon: AlertTriangle },
};

const severityConfig: Record<string, { label: string; color: string }> = {
  critical: { label: "Critical", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  high: { label: "High", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  medium: { label: "Medium", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  low: { label: "Low", color: "bg-slate-500/20 text-slate-300 border-slate-500/30" },
};

export default function ReleaseChecklistPage() {
  const [checklist, setChecklist] = useState<ReleaseChecklist>({
    id: "1",
    version: "v1.0.0",
    title: "Release v1.0.0 - Initial Launch",
    description: "Initial production release of NeuroWealth platform",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sections: [
      {
        id: "functional",
        title: "Functional Checks",
        items: [
          {
            id: "f1",
            title: "User authentication flow",
            description: "Verify login, signup, and wallet connection",
            status: "completed",
            assignee: "John",
            priority: "high",
          },
          {
            id: "f2",
            title: "Transaction processing",
            description: "Test deposit, withdrawal, and strategy execution",
            status: "in-progress",
            assignee: "Sarah",
            priority: "high",
          },
          {
            id: "f3",
            title: "Data persistence",
            description: "Verify localStorage and API data sync",
            status: "pending",
            assignee: "Mike",
            priority: "medium",
          },
          {
            id: "f4",
            title: "Error handling",
            description: "Test error states and user feedback",
            status: "pending",
            assignee: "John",
            priority: "high",
          },
        ],
      },
      {
        id: "visual",
        title: "Visual Checks",
        items: [
          {
            id: "v1",
            title: "Responsive design",
            description: "Verify layout on mobile, tablet, and desktop",
            status: "completed",
            assignee: "Emma",
            priority: "high",
          },
          {
            id: "v2",
            title: "Color contrast",
            description: "Check WCAG AA compliance for all text",
            status: "in-progress",
            assignee: "Emma",
            priority: "medium",
          },
          {
            id: "v3",
            title: "Animation performance",
            description: "Verify smooth animations at 60fps",
            status: "pending",
            assignee: "Sarah",
            priority: "low",
          },
        ],
      },
    ],
    knownIssues: [
      {
        id: "k1",
        title: "Mobile menu animation stutter",
        description: "Menu animation has slight stutter on older Android devices",
        severity: "low",
        workaround: "Use tap instead of swipe",
        status: "open",
      },
    ],
    signOffs: [
      { role: "product", name: "", status: "pending", notes: "" },
      { role: "design", name: "", status: "pending", notes: "" },
      { role: "engineering", name: "", status: "pending", notes: "" },
    ],
  });

  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editingSignOff, setEditingSignOff] = useState<string | null>(null);

  const updateItemStatus = (sectionId: string, itemId: string, status: ChecklistStatus) => {
    setChecklist((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, status } : item
              ),
            }
          : section
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateItemAssignee = (sectionId: string, itemId: string, assignee: string) => {
    setChecklist((prev) => ({
      ...prev,
      sections: prev.sections.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map((item) =>
                item.id === itemId ? { ...item, assignee } : item
              ),
            }
          : section
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateSignOff = (role: "product" | "design" | "engineering", updates: Partial<SignOff>) => {
    setChecklist((prev) => ({
      ...prev,
      signOffs: prev.signOffs.map((signOff) =>
        signOff.role === role ? { ...signOff, ...updates } : signOff
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  const exportSummary = () => {
    const completedItems = checklist.sections.reduce(
      (acc, section) => acc + section.items.filter((i) => i.status === "completed").length,
      0
    );
    const totalItems = checklist.sections.reduce((acc, section) => acc + section.items.length, 0);
    const progress = Math.round((completedItems / totalItems) * 100);

    const summary = `
# Release Checklist: ${checklist.title}
Version: ${checklist.version}
Last Updated: ${new Date(checklist.updatedAt).toLocaleString()}

## Progress: ${progress}% (${completedItems}/${totalItems} items completed)

${checklist.sections.map(
  (section) => {
    const sectionCompleted = section.items.filter((i) => i.status === "completed").length;
    return `
### ${section.title} (${sectionCompleted}/${section.items.length})
${section.items.map((item) => `- [${item.status === "completed" ? "x" : " "}] ${item.title} (${item.assignee || "Unassigned"})`).join("\n")}
`;
  }
).join("\n")}

## Known Issues
${checklist.knownIssues.length === 0 ? "None" : checklist.knownIssues.map((issue) => `- **${issue.title}** (${issue.severity}): ${issue.description}`).join("\n")}

## Sign-offs
${checklist.signOffs.map((signOff) => `- **${signOff.role.charAt(0).toUpperCase() + signOff.role.slice(1)}**: ${signOff.name || "Pending"} (${signOff.status})`).join("\n")}
`.trim();

    const blob = new Blob([summary], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `release-checklist-${checklist.version}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const completedCount = checklist.sections.reduce(
    (acc, section) => acc + section.items.filter((i) => i.status === "completed").length,
    0
  );
  const totalCount = checklist.sections.reduce((acc, section) => acc + section.items.length, 0);
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-dark-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{checklist.title}</h1>
            <p className="text-slate-400 mt-1">{checklist.description}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-dark-800 rounded-lg border border-white/10 px-4 py-2">
              <span className="text-slate-400 text-sm">Progress:</span>
              <span className="text-white font-semibold ml-2">{progress}%</span>
            </div>
            <Button onClick={exportSummary} variant="primary" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-dark-800 rounded-lg border border-white/10 p-4">
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-sky-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-slate-400 text-sm mt-2">
            {completedCount} of {totalCount} items completed
          </p>
        </div>

        {/* Checklist Sections */}
        <div className="space-y-6">
          {checklist.sections.map((section) => (
            <section
              key={section.id}
              className="bg-dark-800 rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-4 md:p-6 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">{section.title}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {section.items.filter((i) => i.status === "completed").length} / {section.items.length} completed
                </p>
              </div>
              <div className="divide-y divide-white/5">
                {section.items.map((item) => {
                  const config = statusConfig[item.status];
                  const StatusIcon = config.icon;
                  return (
                    <div
                      key={item.id}
                      className="p-4 md:p-6 hover:bg-white/5 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-3">
                            <StatusIcon className={`h-5 w-5 mt-0.5 ${item.status === "completed" ? "text-emerald-400" : item.status === "blocked" ? "text-red-400" : "text-slate-400"}`} />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-white font-medium">{item.title}</h3>
                              {item.description && (
                                <p className="text-slate-400 text-sm mt-1">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
                          <select
                            value={item.status}
                            onChange={(e) => updateItemStatus(section.id, item.id, e.target.value as ChecklistStatus)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${config.color} bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50`}
                          >
                            {Object.entries(statusConfig).map(([key, value]) => (
                              <option key={key} value={key} className="bg-dark-900">
                                {value.label}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-2">
                            <span className="text-slate-400 text-xs">Assignee:</span>
                            {editingItem === item.id ? (
                              <input
                                type="text"
                                defaultValue={item.assignee || ""}
                                onBlur={(e) => {
                                  updateItemAssignee(section.id, item.id, e.target.value);
                                  setEditingItem(null);
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    updateItemAssignee(section.id, item.id, e.currentTarget.value);
                                    setEditingItem(null);
                                  }
                                }}
                                autoFocus
                                className="bg-dark-900 border border-sky-500/50 rounded px-2 py-1 text-white text-xs w-24 focus:outline-none"
                              />
                            ) : (
                              <button
                                onClick={() => setEditingItem(item.id)}
                                className="text-slate-300 text-xs hover:text-white flex items-center gap-1"
                              >
                                {item.assignee || "Unassigned"}
                                <Edit2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Known Issues */}
        <section className="bg-dark-800 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Known Issues</h2>
              <p className="text-slate-400 text-sm mt-1">
                {checklist.knownIssues.length} issue{checklist.knownIssues.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {checklist.knownIssues.map((issue) => (
              <div key={issue.id} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-medium">{issue.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium border ${severityConfig[issue.severity].color}`}>
                        {severityConfig[issue.severity].label}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm">{issue.description}</p>
                    {issue.workaround && (
                      <div className="mt-2 p-3 bg-dark-900 rounded-lg border border-white/5">
                        <p className="text-xs text-slate-300">
                          <span className="font-semibold">Workaround:</span> {issue.workaround}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {checklist.knownIssues.length === 0 && (
              <div className="p-8 text-center text-slate-500 italic">
                No known issues
              </div>
            )}
          </div>
        </section>

        {/* Sign-offs */}
        <section className="bg-dark-800 rounded-xl border border-white/10 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">Sign-offs</h2>
            <p className="text-slate-400 text-sm mt-1">
              Required approvals before release
            </p>
          </div>
          <div className="divide-y divide-white/5">
            {checklist.signOffs.map((signOff) => (
              <div key={signOff.role} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-medium capitalize">{signOff.role}</h3>
                    {signOff.notes && (
                      <p className="text-slate-400 text-sm mt-1">{signOff.notes}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Name"
                      value={signOff.name}
                      onChange={(e) => updateSignOff(signOff.role, { name: e.target.value })}
                      className="bg-dark-900 border border-white/10 rounded-lg px-3 py-2 text-white text-sm w-32 md:w-40 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                    <select
                      value={signOff.status}
                      onChange={(e) =>
                        updateSignOff(signOff.role, {
                          status: e.target.value as SignOff["status"],
                        })
                      }
                      className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                        signOff.status === "approved"
                          ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          : signOff.status === "rejected"
                          ? "bg-red-500/20 text-red-300 border-red-500/30"
                          : "bg-slate-500/20 text-slate-300 border-slate-500/30"
                      } bg-transparent cursor-pointer focus:outline-none focus:ring-2 focus:ring-sky-500/50`}
                    >
                      <option value="pending" className="bg-dark-900">Pending</option>
                      <option value="approved" className="bg-dark-900">Approved</option>
                      <option value="rejected" className="bg-dark-900">Rejected</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
