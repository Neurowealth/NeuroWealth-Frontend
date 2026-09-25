"use client";

import { useState } from "react";
import { useToast } from "@/components/notifications/ToastProvider";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Button } from "@/components/ui/Button";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

export default function NotificationsDemo() {
  const { pushToast, dismissToast, setLimit, limit, toasts } = useToast();
  const [showBanner, setShowBanner] = useState<"success" | "info" | "warning" | "error" | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);

  const handleToast = (variant: "success" | "info" | "warning" | "error") => {
    const messages = {
      success: { title: "Changes saved", description: "Your settings have been updated successfully." },
      info: { title: "New feature available", description: "Check out the latest updates in your dashboard." },
      warning: { title: "Session expiring soon", description: "Please save your work before your session ends." },
      error: { title: "Save failed", description: "Could not save your changes. Please try again." },
    };

    pushToast({
      title: messages[variant].title,
      description: messages[variant].description,
      variant,
      duration: 4500,
    });
  };

  const handleMockFlow = (flow: "save" | "failure" | "timeout") => {
    switch (flow) {
      case "save":
        pushToast({ title: "Saving...", description: "Please wait while we save your changes.", variant: "info", duration: 2000 });
        setTimeout(() => {
          pushToast({ title: "Changes saved", description: "Your settings have been updated successfully.", variant: "success", duration: 4500 });
        }, 2000);
        break;
      case "failure":
        pushToast({ title: "Processing...", description: "Please wait while we process your request.", variant: "info", duration: 2000 });
        setTimeout(() => {
          pushToast({ title: "Request failed", description: "Network error occurred. Please check your connection.", variant: "error", duration: 5000 });
        }, 2000);
        break;
      case "timeout":
        pushToast({ title: "Connecting...", description: "Establishing connection to server.", variant: "info", duration: 2000 });
        setTimeout(() => {
          pushToast({ title: "Connection timeout", description: "Server did not respond in time. Please.try again.", variant: "warning", duration: 5500 });
        }, 2000);
        break;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notification System Demo</h1>
          <p className="text-slate-400">Demonstrates toast notifications and inline banners with all variants.</p>
        </div>

        {/* Toast Queue Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Toast Notifications</h2>
          <div className="bg-dark-800 rounded-xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Stacking Limit</h3>
                <p className="text-slate-400 text-sm">Current limit: {limit}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setLimit(1)}>1</Button>
                <Button size="sm" variant="ghost" onClick={() => setLimit(2)}>2</Button>
                <Button size="sm" variant="ghost" onClick={() => setLimit(3)}>3</Button>
                <Button size="sm" variant="ghost" onClick={() => setLimit(5)}>5</Button>
              </div>
            </div>
            <div className="border-t border-white/10 pt-4">
              <p className="text-slate-400 text-sm mb-3">Active toasts: {toasts.length}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => handleToast("success")} variant="primary">Success Toast</Button>
            <Button onClick={() => handleToast("info")} variant="ghost">Info Toast</Button>
            <Button onClick={() => handleToast("warning")} variant="ghost">Warning Toast</Button>
            <Button onClick={() => handleToast("error")} variant="ghost">Error Toast</Button>
          </div>

          <div className="bg-dark-800 rounded-xl border border-white/10 p-6">
            <h3 className="text-white font-medium mb-4">Mock Common Flows</h3>
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => handleMockFlow("save")} variant="primary">Save Flow</Button>
              <Button onClick={() => handleMockFlow("failure")} variant="ghost">Failure Flow</Button>
              <Button onClick={() => handleMockFlow("timeout")} variant="ghost">Timeout Flow</Button>
            </div>
          </div>
        </section>

        {/* Inline Banner Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Inline Banners</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button onClick={() => setShowBanner("success")} variant="ghost">Show Success Banner</Button>
            <Button onClick={() => setShowBanner("info")} variant="ghost">Show Info Banner</Button>
            <Button onClick={() => setShowBanner("warning")} variant="ghost">Show Warning Banner</Button>
            <Button onClick={() => setShowBanner("error")} variant="ghost">Show Error Banner</Button>
          </div>

          {showBanner && (
            <div className="space-y-4">
              <InlineBanner
                variant={showBanner}
                title="Banner Title"
                eyebrow={showBanner === "success" ? "Success" : showBanner === "info" ? "Information" : showBanner === "warning" ? "Warning" : "Error"}
              >
                This is an inline banner with the {showBanner} variant. It can be used for page-level messages that require user attention.
              </InlineBanner>
              <Button size="sm" variant="ghost" onClick={() => setShowBanner(null)}>Hide Banner</Button>
            </div>
          )}
        </section>

        {/* Notification Center Section */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Notification Center</h2>
          <div className="bg-dark-800 rounded-xl border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">In-App Notification Center</h3>
                <p className="text-slate-400 text-sm">View and manage transaction and system event notifications</p>
              </div>
              <Button onClick={() => setShowNotificationCenter(!showNotificationCenter)} variant="ghost">
                {showNotificationCenter ? "Hide" : "Show"} Center
              </Button>
            </div>
            {showNotificationCenter && (
              <div className="mt-4 flex justify-center">
                <NotificationCenter />
              </div>
            )}
          </div>
        </section>

        {/* Accessibility Notes */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Accessibility Features</h2>
          <div className="bg-dark-800 rounded-xl border border-white/10 p-6 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
              <div>
                <h3 className="text-white font-medium">Keyboard Focusable</h3>
                <p className="text-slate-400 text-sm">Close buttons are focusable with Tab key and can be activated with Enter/Space</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
              <div>
                <h3 className="text-white font-medium">Screen Reader Announcements</h3>
                <p className="text-slate-400 text-sm">Uses aria-live regions for polite (info/success) and assertive (warning/error) announcements</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
              <div>
                <h3 className="text-white font-medium">Pause on Hover/Focus</h3>
                <p className="text-slate-400 text-sm">Auto-dismiss timer pauses when hovering or focusing on toast</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
              <div>
                <h3 className="text-white font-medium">Auto-Dismiss (3-6s)</h3>
                <p className="text-slate-400 text-sm">Toasts automatically dismiss after 3-6 seconds (configurable)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-2" />
              <div>
                <h3 className="text-white font-medium">44px Touch Target</h3>
                <p className="text-slate-400 text-sm">Preference toggle controls meet minimum touch target requirements</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
