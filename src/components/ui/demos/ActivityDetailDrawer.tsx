"use client";

import { ArrowUpRight, ArrowDownLeft, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";

export interface ActivityItem {
  id: string;
  type: "deposit" | "withdrawal" | "yield";
  asset: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  timestamp: string;
  txHash?: string;
  from?: string;
  to?: string;
  notes?: string;
}

interface ActivityDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityItem | null;
}

const STATUS_STYLES: Record<ActivityItem["status"], string> = {
  completed: "bg-green-500/10 text-green-400 border-green-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function ActivityDetailDrawer({
  isOpen,
  onClose,
  activity,
}: ActivityDetailDrawerProps) {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    if (!activity?.txHash) return;
    navigator.clipboard.writeText(activity.txHash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const Icon =
    activity?.type === "withdrawal" ? ArrowUpRight : ArrowDownLeft;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction detail"
      footer={
        <Button onClick={onClose} variant="ghost">
          Close
        </Button>
      }
    >
      {activity ? (
        <div className="space-y-5">
          {/* Amount + type */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-zinc-400" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold text-text-primary">
                {activity.amount} {activity.asset}
              </p>
              <p className="text-sm capitalize text-text-secondary">{activity.type}</p>
            </div>
            <span
              className={`ml-auto text-xs font-medium px-2 py-1 rounded-full border capitalize ${STATUS_STYLES[activity.status]}`}
            >
              {activity.status}
            </span>
          </div>

          {/* Details */}
          <dl className="space-y-3 text-sm border-t border-zinc-800 pt-4">
            <div className="flex justify-between">
              <dt className="text-text-secondary">Date</dt>
              <dd className="text-text-primary">{activity.timestamp}</dd>
            </div>
            {activity.from && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary shrink-0">From</dt>
                <dd className="font-mono text-xs text-text-primary truncate">{activity.from}</dd>
              </div>
            )}
            {activity.to && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary shrink-0">To</dt>
                <dd className="font-mono text-xs text-text-primary truncate">{activity.to}</dd>
              </div>
            )}
            {activity.notes && (
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary shrink-0">Notes</dt>
                <dd className="text-text-primary text-right">{activity.notes}</dd>
              </div>
            )}
          </dl>

          {/* Tx hash */}
          {activity.txHash && (
            <div className="space-y-1 border-t border-zinc-800 pt-4">
              <p className="text-xs text-text-muted">Transaction hash</p>
              <div className="flex items-center gap-2 rounded-lg bg-zinc-800 px-3 py-2">
                <code className="text-xs text-zinc-300 flex-1 truncate">
                  {activity.txHash}
                </code>
                <button
                  type="button"
                  onClick={copyHash}
                  aria-label="Copy transaction hash"
                  className="text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-green-400" aria-hidden="true" />
                  ) : (
                    <Copy className="w-4 h-4" aria-hidden="true" />
                  )}
                </button>
                <a
                  href={`https://stellar.expert/explorer/public/tx/${activity.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on Stellar Explorer"
                  className="text-zinc-400 hover:text-sky-400 transition-colors shrink-0"
                >
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-text-secondary">No activity selected.</p>
      )}
    </Drawer>
  );
}
