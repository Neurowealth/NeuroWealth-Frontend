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

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    title: "Transaction Successful",
    message: "Your deposit of 500 USDC has been confirmed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    status: "success",
    isRead: false,
    action: { label: "View Transaction", href: "/dashboard/transactions" },
  },
  {
    id: "2",
    title: "System Update",
    message: "NeuroWealth will undergo maintenance at 2 AM UTC.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    status: "info",
    isRead: false,
  },
  {
    id: "3",
    title: "Wallet Connected",
    message: "Your Stellar wallet has been successfully linked.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    status: "success",
    isRead: true,
  },
  {
    id: "4",
    title: "Action Required",
    message: "Please verify your email address to continue.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    status: "warning",
    isRead: true,
    action: { label: "Verify Email", href: "/profile" },
  },
  {
    id: "5",
    title: "Low Balance",
    message: "Your XLM balance is below the recommended minimum.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    status: "error",
    isRead: true,
  },
];
