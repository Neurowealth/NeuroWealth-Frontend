"use client";

import { useState, useEffect } from "react";
import { Globe, Clock, DollarSign, Save, X, AlertCircle, CheckCircle2, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockAudit } from "@/lib/mock-audit";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";
import { useTheme, ThemeMode } from "@/contexts/ThemeProvider";

interface PreferencesData {
  locale: string;
  timezone: string;
  currencyFormat: string;
  theme: ThemeMode;
}

const LOCALES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "America/New_York", label: "America/New_York — EST (UTC−5)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles — PST (UTC−8)" },
  { value: "Europe/London", label: "Europe/London — GMT (UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris — CET (UTC+1)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo — JST (UTC+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney — AEDT (UTC+11)" },
];

const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)" },
  { value: "CNY", label: "CNY — Chinese Yuan (¥)" },
];

const STORAGE_KEY = "nw_preferences";
const DEFAULT: PreferencesData = {
  locale: "en-US",
  timezone: "UTC",
  currencyFormat: "USD",
  theme: "system",
};

export default function PreferencesPage() {
  const [saved, setSaved] = useState<PreferencesData>(DEFAULT);
  const [draft, setDraft] = useState<PreferencesData>(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setSaved(data);
          setDraft(data);
        }
      } catch {}
      setPageLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return <SettingsSectionSkeleton rows={3} />;
  }

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);

  const handleSave = async () => {
    setSaving(true);
    setStatus("idle");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setSaved(draft);
      setStatus("success");
      setEditing(false);
      mockAudit.logEvent("settings_change", { section: "preferences", changes: draft });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
    setStatus("idle");
  };

  return (
    <div className="preferences-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Preferences</h1>
          <p className="settings-subtitle">Manage language, timezone, and currency settings</p>
        </div>
      </div>

      {status === "success" && (
        <div className="settings-banner settings-banner-success" role="status">
          <CheckCircle2 size={16} />
          <span>Preferences saved successfully</span>
        </div>
      )}

      {status === "error" && (
        <div className="settings-banner settings-banner-error" role="alert">
          <AlertCircle size={16} />
          <span>Failed to save preferences. Please try again.</span>
        </div>
      )}

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Globe size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Localisation</h2>
            <p className="settings-card-desc">Language and regional display preferences</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="locale" className="settings-label">
              Locale
            </label>
            {editing ? (
              <select
                id="locale"
                value={draft.locale}
                onChange={(e) => setDraft({ ...draft, locale: e.target.value })}
                className="settings-select"
              >
                {LOCALES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="settings-value">
                {LOCALES.find((l) => l.value === saved.locale)?.label || saved.locale}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Monitor size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Appearance</h2>
            <p className="settings-card-desc">Theme and visual display preferences</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label className="settings-label">
              Theme
            </label>
            {editing ? (
              <div className="theme-options">
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, theme: "light" })}
                  className={`theme-option ${draft.theme === "light" ? "active" : ""}`}
                >
                  <Sun size={16} />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, theme: "dark" })}
                  className={`theme-option ${draft.theme === "dark" ? "active" : ""}`}
                >
                  <Moon size={16} />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ ...draft, theme: "system" })}
                  className={`theme-option ${draft.theme === "system" ? "active" : ""}`}
                >
                  <Monitor size={16} />
                  <span>System</span>
                </button>
              </div>
            ) : (
              <p className="settings-value">
                {saved.theme === "light" && "Light"}
                {saved.theme === "dark" && "Dark"}
                {saved.theme === "system" && "System"}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Clock size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Time & Currency</h2>
            <p className="settings-card-desc">Timezone and numeric format settings</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="timezone" className="settings-label">
              Timezone
            </label>
            {editing ? (
              <select
                id="timezone"
                value={draft.timezone}
                onChange={(e) => setDraft({ ...draft, timezone: e.target.value })}
                className="settings-select"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="settings-value">
                {TIMEZONES.find((tz) => tz.value === saved.timezone)?.label || saved.timezone}
              </p>
            )}
          </div>

          <div className="settings-field">
            <label htmlFor="currency" className="settings-label">
              Currency Format
            </label>
            {editing ? (
              <select
                id="currency"
                value={draft.currencyFormat}
                onChange={(e) => setDraft({ ...draft, currencyFormat: e.target.value })}
                className="settings-select"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="settings-value">
                {CURRENCIES.find((c) => c.value === saved.currencyFormat)?.label ||
                  saved.currencyFormat}
              </p>
            )}
          </div>
        </div>
      </div>

      {!editing && (
        <Button onClick={() => setEditing(true)} variant="secondary" size="md">
          Edit Preferences
        </Button>
      )}

      {editing && (
        <div className="settings-action-bar" role="group" aria-label="Save or cancel changes">
          {isDirty && <span className="settings-dirty-indicator">Unsaved changes</span>}
          <div className="settings-actions">
            <Button onClick={handleCancel} variant="ghost" size="md" disabled={saving}>
              <X size={16} />
              Cancel
            </Button>
            <Button onClick={handleSave} size="md" disabled={saving} aria-busy={saving}>
              {saving ? (
                <>
                  <span className="settings-spinner" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .preferences-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .settings-title {
          font-size: 24px;
          font-weight: 700;
          color: #e2e8f0;
          margin: 0 0 4px;
        }

        .settings-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }

        .settings-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          border: 1px solid;
          animation: slideDown 0.2s ease-out;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .settings-banner-success {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }

        .settings-banner-success svg {
          color: #10b981;
          flex-shrink: 0;
        }

        .settings-banner-error {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }

        .settings-banner-error svg {
          color: #ef4444;
          flex-shrink: 0;
        }

        .settings-card {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 14px;
          overflow: hidden;
        }

        .settings-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .settings-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          flex-shrink: 0;
        }

        .settings-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 2px;
        }

        .settings-card-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }

        .settings-card-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .settings-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .settings-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .settings-value {
          font-size: 14px;
          color: #e2e8f0;
          margin: 0;
          padding: 9px 0;
        }

        .settings-select {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .settings-select:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .settings-select option {
          background: #0f172a;
          color: #e2e8f0;
        }

        .settings-action-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 20px;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          position: sticky;
          bottom: 24px;
          z-index: 40;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
        }

        .settings-dirty-indicator {
          font-size: 12px;
          color: #f59e0b;
        }

        .settings-actions {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        .settings-spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 520px) {
          .settings-card-header {
            padding: 16px;
          }

          .settings-card-body {
            padding: 16px;
          }

          .settings-action-bar {
            flex-direction: column;
            align-items: stretch;
          }

          .settings-actions {
            flex-direction: column;
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
}
