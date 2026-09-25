export type ChecklistStatus = "pending" | "in-progress" | "completed" | "blocked" | "skipped";

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  status: ChecklistStatus;
  assignee?: string;
  notes?: string;
  priority?: "high" | "medium" | "low";
}

export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
}

export interface SignOff {
  role: "product" | "design" | "engineering";
  name: string;
  signedAt?: string;
  status: "pending" | "approved" | "rejected";
  notes?: string;
}

export interface ReleaseChecklist {
  id: string;
  version: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  sections: ChecklistSection[];
  knownIssues: KnownIssue[];
  signOffs: SignOff[];
}

export interface KnownIssue {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  workaround?: string;
  status: "open" | "in-progress" | "resolved" | "deferred";
}
