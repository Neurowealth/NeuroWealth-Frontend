export type SearchGroup = "Pages" | "Actions" | "Records";

export interface SearchResultItem {
  id: string;
  group: SearchGroup;
  title: string;
  description: string;
  href: string;
  keywords?: string[];
}

export interface GroupedSearchResults {
  Pages: SearchResultItem[];
  Actions: SearchResultItem[];
  Records: SearchResultItem[];
}

const MOCK_SEARCH_INDEX: SearchResultItem[] = [
  {
    id: "page-home",
    group: "Pages",
    title: "Home",
    description: "Landing page with product overview and strategy highlights.",
    href: "/",
    keywords: ["landing", "overview", "marketing"],
  },
  {
    id: "page-dashboard",
    group: "Pages",
    title: "Dashboard",
    description: "Portfolio snapshot, balances, and performance summaries.",
    href: "/dashboard",
    keywords: ["portfolio", "balances", "overview"],
  },
  {
    id: "page-transactions",
    group: "Pages",
    title: "Transactions",
    description: "Manage deposits, withdrawals, and transfers.",
    href: "/dashboard/transactions",
    keywords: ["send", "swap", "transfer"],
  },
  {
    id: "page-history",
    group: "Pages",
    title: "History",
    description: "Review completed activity and status timelines.",
    href: "/dashboard/history",
    keywords: ["activity", "timeline", "status"],
  },
  {
    id: "page-audit",
    group: "Pages",
    title: "Audit",
    description: "Inspect system events, safeguards, and policy checks.",
    href: "/dashboard/audit",
    keywords: ["events", "policy", "compliance"],
  },
  {
    id: "page-profile",
    group: "Pages",
    title: "Profile",
    description: "Update your account identity and preferences.",
    href: "/profile",
    keywords: ["account", "identity", "settings"],
  },
  {
    id: "action-start-deposit",
    group: "Actions",
    title: "Start USDC Deposit",
    description: "Open the transaction flow to fund your account.",
    href: "/dashboard/transactions?kind=deposit",
    keywords: ["add funds", "deposit", "usdc"],
  },
  {
    id: "action-start-withdrawal",
    group: "Actions",
    title: "Start Withdrawal",
    description: "Move funds from your strategy back to wallet.",
    href: "/dashboard/transactions?kind=withdraw",
    keywords: ["cash out", "withdraw", "redeem"],
  },
  {
    id: "action-open-notifications",
    group: "Actions",
    title: "Open Notifications",
    description: "Go to notification preferences and delivery controls.",
    href: "/dashboard/notifications",
    keywords: ["alerts", "email", "push"],
  },
  {
    id: "action-security-settings",
    group: "Actions",
    title: "Security Settings",
    description: "Review account access and operational safeguards.",
    href: "/dashboard/settings",
    keywords: ["security", "permissions", "lock"],
  },
  {
    id: "record-tx-7f1",
    group: "Records",
    title: "TX-7F1C • Deposit • 450 USDC",
    description: "Completed 2 hours ago on testnet.",
    href: "/dashboard/history",
    keywords: ["tx", "record", "deposit", "450"],
  },
  {
    id: "record-tx-912",
    group: "Records",
    title: "TX-912A • Withdrawal • 125 USDC",
    description: "Pending signature confirmation.",
    href: "/dashboard/history",
    keywords: ["tx", "record", "withdraw", "125"],
  },
  {
    id: "record-audit-44",
    group: "Records",
    title: "AUD-44 • Risk Rule Updated",
    description: "Automated risk guardrail threshold adjusted.",
    href: "/dashboard/audit",
    keywords: ["audit", "risk", "rule", "event"],
  },
  {
    id: "record-audit-52",
    group: "Records",
    title: "AUD-52 • Wallet Session Restored",
    description: "Session recovery completed after reconnect.",
    href: "/dashboard/audit",
    keywords: ["audit", "wallet", "session"],
  },
];

const EMPTY_RESULTS: GroupedSearchResults = {
  Pages: [],
  Actions: [],
  Records: [],
};

export async function searchMockIndex(query: string): Promise<GroupedSearchResults> {
  const normalized = query.trim().toLowerCase();

  await new Promise((resolve) => setTimeout(resolve, 120));

  if (!normalized) {
    return EMPTY_RESULTS;
  }

  if (normalized === "error") {
    throw new Error("Mock search failed");
  }

  const filtered = MOCK_SEARCH_INDEX.filter((entry) => {
    const haystack = [entry.title, entry.description, ...(entry.keywords ?? [])]
      .join(" ")
      .toLowerCase();
    return haystack.includes(normalized);
  });

  return {
    Pages: filtered.filter((entry) => entry.group === "Pages"),
    Actions: filtered.filter((entry) => entry.group === "Actions"),
    Records: filtered.filter((entry) => entry.group === "Records"),
  };
}

export function hasAnySearchResults(results: GroupedSearchResults): boolean {
  return (
    results.Pages.length > 0 ||
    results.Actions.length > 0 ||
    results.Records.length > 0
  );
}
