"use client";

import { useState, useCallback, useEffect } from "react";
import {
  AlertTriangle,
  Bell,
  BellOff,
  CheckCircle2,
  Clock3,
  Info,
  Save,
  WifiOff,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useToast } from "@/components/notifications/ToastProvider";
import { Button, Card, InlineBanner } from "@/components/ui";
import { runMockFlow, useMockFlows, type MockFlowKey } from "./mockFlows";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSandbox } from "@/contexts/SandboxContext";
import { SandboxBadge } from "@/components/ui/SandboxBadge";
import { useAsyncState } from "@/hooks/useAsyncState";
import { NotificationListSkeleton } from "@/components/ui/Skeleton";

export const dynamic = "force-dynamic";

// ─── Mock notification data ───────────────────────────────────────────────────

interface NotificationItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: typeof TrendingUp;
}

const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    type: "success",
    title: "Deposit confirmed",
    body: "Your deposit of 500 USDC has been confirmed on the Stellar network.",
    time: "2 minutes ago",
    read: false,
    icon: CheckCircle2,
  },
  {
    id: "n2",
    type: "info",
    title: "Yield distributed",
    body: "You received $3.84 in yield rewards for the past 24 hours.",
    time: "1 hour ago",
    read: false,
    icon: TrendingUp,
  },
  {
    id: "n3",
    type: "warning",
    title: "Wallet session expiring",
    body: "Your wallet session will expire in 15 minutes. Reconnect to keep access.",
    time: "3 hours ago",
    read: true,
    icon: Clock3,
  },
  {
    id: "n4",
    type: "info",
    title: "Portfolio rebalanced",
    body: "Your portfolio was automatically rebalanced according to your strategy settings.",
    time: "Yesterday",
    read: true,
    icon: RefreshCw,
  },
  {
    id: "n5",
    type: "success",
    title: "Security check passed",
    body: "Your scheduled security audit completed with no issues found.",
    time: "2 days ago",
    read: true,
    icon: ShieldCheck,
  },
];

const TYPE_STYLES: Record<NotificationItem["type"], string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  error: "bg-red-500/10 text-red-400 border-red-500/20",
};

// ─── Toast demo data (preserved from original page) ───────────────────────────

const toastExamples = [
  { variant: "success" as const, title: "Saved successfully", description: "Portfolio notification defaults were updated across your account.", icon: CheckCircle2 },
  { variant: "info" as const, title: "Heads up", description: "Yield opportunities refresh every few minutes while this panel stays open.", icon: Info },
  { variant: "warning" as const, title: "Timeout approaching", description: "Your wallet session is about to expire. Review and reconnect if needed.", icon: Clock3 },
  { variant: "error" as const, title: "Network failure", description: "We could not reach the notification service. Try again in a moment.", icon: WifiOff },
];

const bannerExamples = [
  { variant: "info" as const, title: "Informational page banner", description: "Use this for lightweight guidance when users should keep working without interruption." },
  { variant: "success" as const, title: "Success page banner", description: "Use this after completed workflows when the whole page should acknowledge the result." },
  { variant: "warning" as const, title: "Warning page banner", description: "Use this when something needs attention soon, but the flow is still recoverable." },
  { variant: "error" as const, title: "Error page banner", description: "Use this when a workflow is blocked and the page should point toward recovery actions." },
];

// ─── Notification inbox ───────────────────────────────────────────────────────

function NotificationInbox() {
  const { getCurrentScenario, isSandboxMode } = useSandbox();
  const [items, setItems] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const { state: fetchState, run: fetchNotifications } = useAsyncState<NotificationItem[]>();
  const scenario = getCurrentScenario("notifications");

  useEffect(() => {
    fetchNotifications(async () => {
      if (scenario === "loading") {
        await new Promise((r) => setTimeout(r, 3000));
      }
      return MOCK_NOTIFICATIONS;
    }).then(() => {
      setItems(MOCK_NOTIFICATIONS);
    });
  }, [scenario, fetchNotifications]);

  const simLoading = fetchState.status === "loading";

  const markAllRead = () => setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setItems((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  const unreadCount = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-slate-100">Notification Inbox</h2>
          {unreadCount > 0 && scenario === "success" && (
            <span className="rounded-full bg-sky-500/20 border border-sky-500/30 px-2 py-0.5 text-xs font-semibold text-sky-300">
              {unreadCount} new
            </span>
          )}
        </div>
        {isSandboxMode && <SandboxBadge scenario={scenario} />}
        {scenario === "success" && unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {simLoading && <NotificationListSkeleton items={4} />}

      {!simLoading && scenario === "empty" && (
        <EmptyState
          icon={<BellOff className="h-8 w-8" aria-hidden="true" />}
          heading="No notifications yet"
          body="You're all caught up. New alerts for deposits, yield payouts, security events, and portfolio changes will appear here."
          ctaLabel="Manage notification settings"
          ctaHref="/dashboard/settings/notifications"
        />
      )}

      {!simLoading && scenario === "partial-failure" && (
        <>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/8 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-amber-300">Some notifications could not be loaded. Showing partial results.</p>
          </div>
          {items.slice(0, 2).map((n) => <NotificationRow key={n.id} item={n} onRead={markRead} />)}
        </>
      )}

      {!simLoading && (scenario === "success" || scenario === "timeout") && (
        <div className="space-y-2" role="list" aria-label="Notifications">
          {items.map((n) => <NotificationRow key={n.id} item={n} onRead={markRead} />)}
        </div>
      )}
    </div>
  );
}

function NotificationRow({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const Icon = item.icon;
  return (
    <div
      role="listitem"
      className={`relative rounded-xl border transition-colors ${
        item.read
          ? "border-slate-700/50 bg-dark-800/70"
          : "border-sky-500/20 bg-sky-500/5"
      }`}
    >
      {!item.read && (
        <span className="absolute top-4 right-4 h-2 w-2 rounded-full bg-sky-400" aria-label="Unread" />
      )}
      <div className="flex items-start gap-3 p-4 pr-8">
        <div className={`mt-0.5 rounded-xl border p-2 ${TYPE_STYLES[item.type]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-100">{item.title}</p>
          <p className="mt-0.5 text-sm text-slate-400 max-w-[420px]">{item.body}</p>
          <p className="mt-1 text-xs text-slate-500">{item.time}</p>
        </div>
        {!item.read && (
          <button
            onClick={() => onRead(item.id)}
            className="shrink-0 text-xs text-sky-400 hover:text-sky-300 transition-colors mt-0.5"
            aria-label={`Mark "${item.title}" as read`}
          >
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Toast system demo (preserved) ───────────────────────────────────────────

function ToastSystemDemo() {
  const { limit, pushToast, setLimit } = useToast();
  const { activeFlow, triggerMockFlow } = useMockFlows(pushToast);

  return (
    <>
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">Issue #88</p>
        <h2 className="text-3xl font-bold text-slate-50">Toast and inline banner system</h2>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          This section exercises the global toast queue, page-level banners, and mocked success,
          failure, and timeout flows. Toasts auto-dismiss within 3 to 6 seconds and pause while
          hovered or focused.
        </p>
      </div>

      <InlineBanner variant="info" eyebrow="Reusable Banner" title="Page-level messages share the same theme language as toasts">
        Variants are semantic, screen-reader friendly, and ready to drop into workflow pages,
        settings pages, or onboarding checkpoints.
      </InlineBanner>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5 border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
              <Bell className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Toast queue controls</h3>
              <p className="mt-1 text-sm text-slate-400">Trigger each variant directly and tune the visible stack size. Default stack limit is 3.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-950/35 p-4">
            <label htmlFor="toast-limit" className="text-sm font-medium text-slate-300">Visible stack limit</label>
            <input
              id="toast-limit"
              type="range"
              min={1}
              max={5}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-40 accent-sky-400"
            />
            <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300">{limit}</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {toastExamples.map((ex) => {
              const Icon = ex.icon;
              return (
                <button
                  key={ex.variant}
                  type="button"
                  onClick={() => pushToast(ex)}
                  className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4 text-left transition hover:border-slate-500 hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-100"><Icon className="h-4 w-4" /></div>
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-100">{ex.variant}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Push toast</p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{ex.description}</p>
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="space-y-5 border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-300">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Mock flows</h3>
              <p className="mt-1 text-sm text-slate-400">These cover the common issue scenarios requested in the spec.</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button onClick={() => triggerMockFlow("save")} disabled={activeFlow === "save"} className="justify-start">
              <Save className="h-4 w-4" />
              {activeFlow === "save" ? "Running save flow..." : "Mock save success"}
            </Button>
            <Button variant="destructive" onClick={() => triggerMockFlow("failure")} disabled={activeFlow === "failure"} className="justify-start">
              <WifiOff className="h-4 w-4" />
              {activeFlow === "failure" ? "Running failure flow..." : "Mock failure"}
            </Button>
            <Button variant="secondary" onClick={() => triggerMockFlow("timeout")} disabled={activeFlow === "timeout"} className="justify-start">
              <Clock3 className="h-4 w-4" />
              {activeFlow === "timeout" ? "Running timeout flow..." : "Mock timeout warning"}
            </Button>
          </div>

          <p className="rounded-xl border border-slate-700/50 bg-slate-950/35 px-4 py-3 text-sm leading-6 text-slate-400">
            Hover a toast to pause dismissal, tab to the close button to verify focus behavior,
            and use the slider to confirm stack truncation.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {bannerExamples.map((b) => (
          <InlineBanner key={b.variant} variant={b.variant} eyebrow="Variant Preview" title={b.title}>
            {b.description}
          </InlineBanner>
        ))}
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<"inbox" | "demo">("inbox");

  return (
    <div className="space-y-6 px-6 py-8">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-slate-700/50 bg-slate-950/35 p-1 w-fit" role="tablist" aria-label="Notifications sections">
        {([["inbox", "Inbox"], ["demo", "System Demo"]] as const).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={activeTab === id}
            aria-controls={`tabpanel-${id}`}
            id={`tab-${id}`}
            onClick={() => setActiveTab(id)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sky-400/70 ${
              activeTab === id
                ? "bg-slate-800 text-slate-100 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div id="tabpanel-inbox" role="tabpanel" aria-labelledby="tab-inbox" hidden={activeTab !== "inbox"}>
        <NotificationInbox />
      </div>

      <div id="tabpanel-demo" role="tabpanel" aria-labelledby="tab-demo" hidden={activeTab !== "demo"} className="space-y-6">
        <ToastSystemDemo />
      </div>
    </div>
  );
}
