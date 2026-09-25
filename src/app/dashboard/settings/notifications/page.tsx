"use client";

import { AlertCircle, Bell, Mail, Save, ShieldAlert, X } from "lucide-react";
import { useToast } from "@/components/notifications/ToastProvider";
import { useI18n } from "@/contexts/I18nContext";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { getApiErrorPresentation } from "@/lib/logger";
import {
  DEFAULT_PREFERENCES,
  type NotificationPreferences,
} from "@/lib/mock-preferences";

export const dynamic = "force-dynamic";
import { Button, Card, InlineBanner } from "@/components/ui";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { PreferenceToggle } from "./PreferenceToggle";

const STORAGE_KEY = STORAGE_KEYS.NOTIFICATIONS;

/**
 * This page and the notification-bell dropdown (NotificationPreferencesUI /
 * useNotificationPreferences) both read/write the shared NotificationPreferences
 * model from src/lib/mock-preferences.ts under the same STORAGE_KEYS.NOTIFICATIONS
 * key, so toggling one no longer silently corrupts the other's shape. This
 * page's five toggles map onto the shared model's nested fields below.
 */
type TogglePath =
  | ["channels", "email"]
  | ["categories", "transactions"]
  | ["emailDigest", "weeklyDigest"]
  | ["categories", "promotions"]
  | ["emailDigest", "securityAlerts"];

export default function NotificationsSettingsPage() {
  const { pushToast } = useToast();
  const { messages } = useI18n();
  const t = messages.settings.notifications;
  const {
    draft,
    setDraft,
    editing,
    setEditing,
    saving,
    status,
    pageLoading,
    isDirty,
    handleSave,
    handleCancel,
  } = useSettingsForm<NotificationPreferences>(STORAGE_KEY, DEFAULT_PREFERENCES, {
    auditSection: "notifications",
    loadDelayMs: 500,
    saveDelayMs: 800,
    validate: (current) => {
      if (!current.emailDigest.securityAlerts) {
        throw new Error("Security alerts must stay enabled in this mock.");
      }
    },
    onSaveSuccess: () => {
      pushToast({
        variant: "success",
        title: t.toast.savedTitle,
        description: t.toast.savedDesc,
        duration: 4000,
      });
    },
    onSaveError: (error) => {
      const copy = getApiErrorPresentation(error, {
        title: t.toast.failTitle,
        description: t.toast.failDesc,
      });
      pushToast({
        variant: "error",
        title: copy.title,
        description: copy.description,
        duration: 6000,
      });
    },
  });

  if (pageLoading) {
    return <SettingsSectionSkeleton rows={5} />;
  }

  const enabledCount = [
    draft.channels.email,
    draft.categories.transactions,
    draft.emailDigest.weeklyDigest,
    draft.categories.promotions,
    draft.emailDigest.securityAlerts,
  ].filter(Boolean).length;

  const togglePreference = ([section, key]: TogglePath) => {
    setDraft((current) => {
      const sectionValue = current[section] as Record<string, boolean>;
      return {
        ...current,
        [section]: {
          ...sectionValue,
          [key]: !sectionValue[key],
        },
      };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
        <p className="text-sm text-slate-400">{t.subtitle}</p>
      </div>

      <InlineBanner
        variant="info"
        eyebrow="Page Message"
        title="Inline banners are now reusable across settings and workflow pages"
        action={
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
      >
        Page-level messages use semantic variants, accessible announcements, and consistent spacing.
      </InlineBanner>

      {status === "success" ? (
        <InlineBanner variant="success" title={t.banner.savedTitle}>
          The changes were persisted locally and announced through the global toast queue.
        </InlineBanner>
      ) : null}

      {status === "error" ? (
        <InlineBanner
          variant="error"
          title={t.banner.failTitle}
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!draft.emailDigest.securityAlerts) {
                  togglePreference(["emailDigest", "securityAlerts"]);
                }
              }}
            >
              {t.actions.restoreAlerts}
            </Button>
          }
        >
          This mocked failure path intentionally blocks saving while security alerts are disabled.
        </InlineBanner>
      ) : null}

      {!draft.emailDigest.securityAlerts ? (
        <InlineBanner variant="warning" title={t.securityAlertsOff.title}>
          {t.securityAlertsOff.desc}
        </InlineBanner>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
        <Card className="space-y-6 border-slate-700/50 bg-dark-800/70">
          <div className="flex items-start gap-3">
            <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-100">{t.channels.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{t.channels.desc}</p>
            </div>
          </div>

          <div className="space-y-3">
            <PreferenceToggle
              id="email-notifications"
              title={t.channels.emailTitle}
              description={t.channels.emailDesc}
              checked={draft.channels.email}
              disabled={!editing}
              onChange={() => togglePreference(["channels", "email"])}
            />
            <PreferenceToggle
              id="transaction-alerts"
              title={t.channels.transactionTitle}
              description={t.channels.transactionDesc}
              checked={draft.categories.transactions}
              disabled={!editing || !draft.channels.email}
              onChange={() => togglePreference(["categories", "transactions"])}
            />
            <PreferenceToggle
              id="weekly-digest"
              title={t.channels.weeklyTitle}
              description={t.channels.weeklyDesc}
              checked={draft.emailDigest.weeklyDigest}
              disabled={!editing || !draft.channels.email}
              onChange={() => togglePreference(["emailDigest", "weeklyDigest"])}
            />
            <PreferenceToggle
              id="marketing-emails"
              title={t.channels.productTitle}
              description={t.channels.productDesc}
              checked={draft.categories.promotions}
              disabled={!editing || !draft.channels.email}
              onChange={() => togglePreference(["categories", "promotions"])}
            />
            <PreferenceToggle
              id="security-alerts"
              title={t.channels.securityTitle}
              description={t.channels.securityDesc}
              checked={draft.emailDigest.securityAlerts}
              disabled={!editing}
              onChange={() => togglePreference(["emailDigest", "securityAlerts"])}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="space-y-4 border-slate-700/50 bg-dark-800/70">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-sky-400/25 bg-sky-500/10 p-2 text-sky-300">
                <Bell className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{t.summary.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{t.summary.desc}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-950/35 px-4 py-3 text-sm">
                <span className="text-slate-300">{t.summary.enabledPreferences}</span>
                <span className="font-semibold text-sky-300">{enabledCount} / 5</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-950/35 px-4 py-3 text-sm">
                <span className="text-slate-300">{t.summary.emailChannel}</span>
                <span className="font-semibold text-slate-100">
                  {draft.channels.email ? t.summary.active : t.summary.muted}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-700/50 bg-slate-950/35 px-4 py-3 text-sm">
                <span className="text-slate-300">{t.summary.securityCoverage}</span>
                <span
                  className={
                    draft.emailDigest.securityAlerts
                      ? "font-semibold text-emerald-300"
                      : "font-semibold text-amber-300"
                  }
                >
                  {draft.emailDigest.securityAlerts ? t.summary.protected : t.summary.atRisk}
                </span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 border-slate-700/50 bg-dark-800/70">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-amber-400/25 bg-amber-500/10 p-2 text-amber-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">{t.saveBehavior.title}</h2>
                <p className="mt-1 text-sm text-slate-400">{t.saveBehavior.desc}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {!editing ? (
        <div>
          <Button variant="secondary" onClick={() => setEditing(true)}>
            {t.actions.edit}
          </Button>
        </div>
      ) : (
        <div
          className="sticky bottom-6 z-40 flex flex-col gap-3 rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur md:flex-row md:items-center md:justify-between"
          style={{ paddingBottom: "max(1rem, calc(1rem + var(--sai-bottom, 0px)))" }}
          role="group"
          aria-label="Notification settings actions"
        >
          <div className="flex items-center gap-2 text-sm text-amber-300">
            <AlertCircle className="h-4 w-4" />
            <span>{isDirty ? t.actions.unsaved : t.actions.noPending}</span>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4" />
              {t.actions.cancel}
            </Button>
            <Button onClick={handleSave} disabled={saving || !isDirty} aria-busy={saving}>
              <Save className="h-4 w-4" />
              {saving ? t.actions.saving : t.actions.save}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
