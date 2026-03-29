"use client";

import { Drawer } from "@/components/ui";

interface Activity {
  id: string;
  type: "deposit" | "withdrawal" | "trade" | "dividend";
  amount: string;
  date: string;
  status: "completed" | "pending" | "failed";
  description: string;
  reference: string;
}

interface ActivityDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activity: Activity | null;
}

const statusStyles = {
  completed: "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
};

const typeLabels = {
  deposit: "Deposit",
  withdrawal: "Withdrawal",
  trade: "Trade",
  dividend: "Dividend",
};

export function ActivityDetailDrawer({ isOpen, onClose, activity }: ActivityDetailDrawerProps) {
  if (!activity) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Close
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{activity.amount}</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[activity.status]}`}>
            {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
          </span>
        </div>

        <div className="space-y-3 divide-y divide-zinc-100 dark:divide-zinc-800">
          {[
            { label: "Type", value: typeLabels[activity.type] },
            { label: "Date", value: activity.date },
            { label: "Description", value: activity.description },
            { label: "Reference", value: activity.reference },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between pt-3 first:pt-0">
              <span className="text-sm text-zinc-500 dark:text-zinc-500">{label}</span>
              <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right max-w-[60%]">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Drawer>
  );
}
