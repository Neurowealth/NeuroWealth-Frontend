"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Info,
  Save,
  WifiOff,
} from "lucide-react";
import { useToast } from "@/components/notifications/ToastProvider";
import { Button, Card, InlineBanner } from "@/components/ui";

const toastExamples = [
  {
    variant: "success" as const,
    title: "Saved successfully",
    description: "Portfolio notification defaults were updated across your account.",
    icon: CheckCircle2,
  },
  {
    variant: "info" as const,
    title: "Heads up",
    description: "Yield opportunities refresh every few minutes while this panel stays open.",
    icon: Info,
  },
  {
    variant: "warning" as const,
    title: "Timeout approaching",
    description: "Your wallet session is about to expire. Review and reconnect if needed.",
    icon: Clock3,
  },
  {
    variant: "error" as const,
    title: "Network failure",
    description: "We could not reach the notification service. Try again in a moment.",
    icon: WifiOff,
  },
];

const bannerExamples = [
  {
    variant: "info" as const,
    title: "Informational page banner",
    description: "Use this for lightweight guidance when users should keep working without interruption.",
  },
  {
    variant: "success" as const,
    title: "Success page banner",
    description: "Use this after completed workflows when the whole page should acknowledge the result.",
  },
  {
    variant: "warning" as const,
    title: "Warning page banner",
    description: "Use this when something needs attention soon, but the flow is still recoverable.",
  },
  {
    variant: "error" as const,
    title: "Error page banner",
    description: "Use this when a workflow is blocked and the page should point toward recovery actions.",
  },
];

export default function NotificationsPage() {
  const { limit, pushToast, setLimit } = useToast();
  const [activeFlow, setActiveFlow] = useState<"save" | "failure" | "timeout" | null>(null);

  const triggerMockFlow = async (flow: "save" | "failure" | "timeout") => {
    setActiveFlow(flow);

    if (flow === "save") {
      pushToast({
        variant: "info",
        title: "Saving changes",
        description: "We are syncing your latest notification rules now.",
        duration: 3000,
      });
      await new Promise((resolve) => setTimeout(resolve, 700));
      pushToast({
        variant: "success",
        title: "Preferences saved",
        description: "All notification changes were applied successfully.",
        duration: 4000,
      });
    }

    if (flow === "failure") {
      pushToast({
        variant: "error",
        title: "Delivery failed",
        description: "The server rejected this request. Check your connection and try again.",
        duration: 6000,
      });
    }

    if (flow === "timeout") {
      pushToast({
        variant: "warning",
        title: "Session timeout warning",
        description: "Your review session will expire soon unless activity resumes.",
        duration: 6000,
      });
    }

    setTimeout(() => setActiveFlow(null), 1000);
  };

  return (
    <main className="space-y-6 px-6 py-8">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-300">
          Issue #88
        </p>
        <h1 className="text-3xl font-bold text-slate-50">Toast and inline banner system</h1>
        <p className="max-w-3xl text-sm leading-6 text-slate-400">
          This page exercises the global toast queue, page-level banners, and mocked success,
          failure, and timeout flows. Toasts auto-dismiss within 3 to 6 seconds and pause while
          hovered or focused.
        </p>
      </div>

      <InlineBanner
        variant="info"
        eyebrow="Reusable Banner"
        title="Page-level messages share the same theme language as toasts"
      >
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
              <h2 className="text-lg font-semibold text-slate-100">Toast queue controls</h2>
              <p className="mt-1 text-sm text-slate-400">
                Trigger each variant directly and tune the visible stack size. Default stack limit
                is 3.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-950/35 p-4">
            <label htmlFor="toast-limit" className="text-sm font-medium text-slate-300">
              Visible stack limit
            </label>
            <input
              id="toast-limit"
              type="range"
              min={1}
              max={5}
              value={limit}
              onChange={(event) => setLimit(Number(event.target.value))}
              className="w-40 accent-sky-400"
            />
            <span className="rounded-full border border-sky-400/25 bg-sky-500/10 px-3 py-1 text-sm font-semibold text-sky-300">
              {limit}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {toastExamples.map((example) => {
              const Icon = example.icon;

              return (
                <button
                  key={example.variant}
                  type="button"
                  onClick={() => pushToast(example)}
                  className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4 text-left transition hover:border-slate-500 hover:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-sky-400/70"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-2 text-slate-100">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize text-slate-100">
                        {example.variant}
                      </p>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        Push toast
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-400">{example.description}</p>
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
              <h2 className="text-lg font-semibold text-slate-100">Mock flows</h2>
              <p className="mt-1 text-sm text-slate-400">
                These cover the common issue scenarios requested in the spec.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={() => triggerMockFlow("save")}
              disabled={activeFlow === "save"}
              className="justify-start"
            >
              <Save className="h-4 w-4" />
              {activeFlow === "save" ? "Running save flow..." : "Mock save success"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => triggerMockFlow("failure")}
              disabled={activeFlow === "failure"}
              className="justify-start"
            >
              <WifiOff className="h-4 w-4" />
              {activeFlow === "failure" ? "Running failure flow..." : "Mock failure"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => triggerMockFlow("timeout")}
              disabled={activeFlow === "timeout"}
              className="justify-start"
            >
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
        {bannerExamples.map((banner) => (
          <InlineBanner
            key={banner.variant}
            variant={banner.variant}
            eyebrow="Variant Preview"
            title={banner.title}
          >
            {banner.description}
          </InlineBanner>
        ))}
      </div>
    </main>
  );
}
