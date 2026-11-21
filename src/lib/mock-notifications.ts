export type NotificationStatus = "info" | "success" | "warning" | "error";

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  isRead: boolean;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Fixed reference instant the mock timestamps are offset from. Reading the
 * wall clock here made the server and client bundles compute different
 * strings, which breaks hydration of server-rendered lists.
 */
export const MOCK_NOTIFICATIONS_REFERENCE_TIME = Date.UTC(2026, 0, 15, 12, 0, 0);

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

const ago = (ms: number): string =>
  new Date(MOCK_NOTIFICATIONS_REFERENCE_TIME - ms).toISOString();

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Transaction Successful",
    message: "Your deposit of 500 USDC has been confirmed.",
    timestamp: ago(5 * MINUTE_MS), // 5 mins ago
    status: "success",
    isRead: false,
    action: { label: "View Transaction", href: "/dashboard/transactions" },
  },
  {
    id: "2",
    title: "System Update",
    message: "NeuroWealth will undergo maintenance at 2 AM UTC.",
    timestamp: ago(2 * HOUR_MS), // 2 hours ago
    status: "info",
    isRead: false,
  },
  {
    id: "3",
    title: "Wallet Connected",
    message: "Your Stellar wallet has been successfully linked.",
    timestamp: ago(DAY_MS), // 1 day ago
    status: "success",
    isRead: true,
  },
  {
    id: "4",
    title: "Action Required",
    message: "Please verify your email address to continue.",
    timestamp: ago(2 * DAY_MS), // 2 days ago
    status: "warning",
    isRead: true,
    action: { label: "Verify Email", href: "/profile" },
  },
  {
    id: "5",
    title: "Low Balance",
    message: "Your XLM balance is below the recommended minimum.",
    timestamp: ago(3 * DAY_MS), // 3 days ago
    status: "error",
    isRead: true,
  },
];
