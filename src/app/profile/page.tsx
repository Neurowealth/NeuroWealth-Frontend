"use client";

import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import {
  User,
  Globe,
  Clock,
  DollarSign,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Pencil,
} from "lucide-react";
import { ProfileFormSkeleton } from "@/components/ui/Skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileData {
  displayName: string;
  locale: string;
  timezone: string;
  currencyFormat: string;
}

interface ValidationErrors {
  displayName?: string;
  locale?: string;
  timezone?: string;
  currencyFormat?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LOCALES = [
  { value: "en-US", label: "English (United States)" },
  { value: "en-GB", label: "English (United Kingdom)" },
  { value: "en-NG", label: "English (Nigeria)" },
  { value: "fr-FR", label: "French (France)" },
  { value: "de-DE", label: "German (Germany)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "ja-JP", label: "Japanese (Japan)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC — Coordinated Universal Time" },
  { value: "America/New_York", label: "America/New_York — EST (UTC−5)" },
  { value: "America/Chicago", label: "America/Chicago — CST (UTC−6)" },
  { value: "America/Denver", label: "America/Denver — MST (UTC−7)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles — PST (UTC−8)" },
  { value: "Europe/London", label: "Europe/London — GMT (UTC+0)" },
  { value: "Europe/Paris", label: "Europe/Paris — CET (UTC+1)" },
  { value: "Europe/Berlin", label: "Europe/Berlin — CET (UTC+1)" },
  { value: "Africa/Lagos", label: "Africa/Lagos — WAT (UTC+1)" },
  { value: "Africa/Nairobi", label: "Africa/Nairobi — EAT (UTC+3)" },
  { value: "Asia/Dubai", label: "Asia/Dubai — GST (UTC+4)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata — IST (UTC+5:30)" },
  { value: "Asia/Singapore", label: "Asia/Singapore — SGT (UTC+8)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo — JST (UTC+9)" },
  { value: "Australia/Sydney", label: "Australia/Sydney — AEDT (UTC+11)" },
];

const CURRENCY_FORMATS = [
  { value: "USD", label: "USD — US Dollar ($)" },
  { value: "EUR", label: "EUR — Euro (€)" },
  { value: "GBP", label: "GBP — British Pound (£)" },
  { value: "NGN", label: "NGN — Nigerian Naira (₦)" },
  { value: "JPY", label: "JPY — Japanese Yen (¥)" },
  { value: "CNY", label: "CNY — Chinese Yuan (¥)" },
  { value: "INR", label: "INR — Indian Rupee (₹)" },
  { value: "AED", label: "AED — UAE Dirham (د.إ)" },
  { value: "BRL", label: "BRL — Brazilian Real (R$)" },
  { value: "CAD", label: "CAD — Canadian Dollar (CA$)" },
];

const STORAGE_KEY = "neurowealth_profile";

const DEFAULT_PROFILE: ProfileData = {
  displayName: "",
  locale: "en-US",
  timezone: "UTC",
  currencyFormat: "USD",
};

// ─── Mock API ─────────────────────────────────────────────────────────────────

function mockSaveProfile(data: ProfileData): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate occasional network errors (10% chance)
      if (Math.random() < 0.1) {
        reject(new Error("Network error — please try again."));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        resolve();
      }
    }, 800);
  });
}

function mockLoadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_PROFILE;
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(data: ProfileData): ValidationErrors {
  const errors: ValidationErrors = {};
  if (!data.displayName.trim()) {
    errors.displayName = "Display name is required.";
  } else if (data.displayName.trim().length < 2) {
    errors.displayName = "Display name must be at least 2 characters.";
  } else if (data.displayName.trim().length > 40) {
    errors.displayName = "Display name must be 40 characters or fewer.";
  }
  if (!data.locale) errors.locale = "Please select a locale.";
  if (!data.timezone) errors.timezone = "Please select a timezone.";
  if (!data.currencyFormat)
    errors.currencyFormat = "Please select a currency format.";
  return errors;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="profile-card">
      <div className="profile-card-header">
        <div className="profile-card-icon">{icon}</div>
        <div>
          <h2 className="profile-card-title">{title}</h2>
          <p className="profile-card-desc">{description}</p>
        </div>
      </div>
      <div className="profile-card-body">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="profile-field">
      <label className="profile-label">{label}</label>
      {children}
      {error && (
        <span className="profile-error-inline" role="alert">
          <AlertCircle size={13} />
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [saved, setSaved] = useState<ProfileData>(DEFAULT_PROFILE);
  const [draft, setDraft] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );
  const [saveError, setSaveError] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    // Simulate async profile load
    const timer = setTimeout(() => {
      const loaded = mockLoadProfile();
      setSaved(loaded);
      setDraft(loaded);
      setProfileLoading(false);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const errorCount = Object.keys(errors).length;

  const handleChange = useCallback(
    (field: keyof ProfileData, value: string) => {
      setDraft((prev) => ({ ...prev, [field]: value }));
      // Clear per-field error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const handleEdit = () => {
    setDraft(saved);
    setErrors({});
    setSaveStatus("idle");
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(saved);
    setErrors({});
    setSaveStatus("idle");
    setEditing(false);
  };

  const handleSave = async () => {
    const newErrors = validate(draft);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setSaving(true);
    setSaveStatus("idle");
    setSaveError("");

    try {
      await mockSaveProfile(draft);
      setSaved(draft);
      setSaveStatus("success");
      setEditing(false);
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err: unknown) {
      setSaveStatus("error");
      setSaveError(
        err instanceof Error ? err.message : "Unknown error occurred.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <>
        <Navbar />
        <div className="profile-page">
          <ProfileFormSkeleton />
        </div>
      </>
    );
  }

  const initials = saved.displayName
    ? saved.displayName
        .trim()
        .split(/\s+/)
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "NW";

  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    NGN: "₦",
    JPY: "¥",
    CNY: "¥",
    INR: "₹",
    AED: "د.إ",
    BRL: "R$",
    CAD: "CA$",
  };

  return (
    <>
      <Navbar />
      <div className="profile-page">
        {/* ── Page Header ── */}
        <div className="profile-page-header">
          <div className="profile-avatar" aria-hidden="true">
            {initials}
          </div>
          <div>
            <h1 className="profile-page-title">
              {saved.displayName || "Your Profile"}
            </h1>
            <p className="profile-page-subtitle">
              Manage account details, preferences &amp; display settings
            </p>
          </div>
          {!editing && (
            <button className="btn-secondary" onClick={handleEdit}>
              <Pencil size={15} />
              Edit profile
            </button>
          )}
        </div>

        {/* ── Breadcrumb ── */}
        <nav className="profile-breadcrumb" aria-label="breadcrumb">
          <span>Dashboard</span>
          <ChevronRight size={13} />
          <span className="active">Profile</span>
        </nav>

        {/* ── Error summary banner ── */}
        {editing && errorCount > 0 && (
          <div className="banner banner-error" role="alert">
            <AlertCircle size={16} />
            <div>
              <strong>
                Please fix {errorCount} error{errorCount > 1 ? "s" : ""} before
                saving
              </strong>
              <ul>
                {Object.values(errors).map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* ── Save error banner ── */}
        {saveStatus === "error" && (
          <div className="banner banner-error" role="alert">
            <AlertCircle size={16} />
            <span>{saveError}</span>
          </div>
        )}

        {/* ── Success banner ── */}
        {saveStatus === "success" && (
          <div className="banner banner-success" role="status">
            <CheckCircle2 size={16} />
            <span>Profile saved successfully.</span>
          </div>
        )}

        {/* ── Card: Identity ── */}
        <SectionCard
          icon={<User size={18} />}
          title="Identity"
          description="How you appear across the platform"
        >
          <Field label="Display name" error={errors.displayName}>
            {editing ? (
              <input
                className={`profile-input ${errors.displayName ? "input-error" : ""}`}
                type="text"
                value={draft.displayName}
                onChange={(e) => handleChange("displayName", e.target.value)}
                placeholder="e.g. Amara Okonkwo"
                maxLength={40}
                aria-invalid={!!errors.displayName}
                aria-describedby={
                  errors.displayName ? "err-displayName" : undefined
                }
              />
            ) : (
              <p className="profile-value">
                {saved.displayName || (
                  <span className="placeholder-text">Not set</span>
                )}
              </p>
            )}
          </Field>
        </SectionCard>

        {/* ── Card: Localisation ── */}
        <SectionCard
          icon={<Globe size={18} />}
          title="Localisation"
          description="Language and regional display preferences"
        >
          <Field label="Locale" error={errors.locale}>
            {editing ? (
              <select
                className={`profile-select ${errors.locale ? "input-error" : ""}`}
                value={draft.locale}
                onChange={(e) => handleChange("locale", e.target.value)}
                aria-invalid={!!errors.locale}
              >
                {LOCALES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="profile-value">
                {LOCALES.find((l) => l.value === saved.locale)?.label ||
                  saved.locale}
              </p>
            )}
          </Field>
        </SectionCard>

        {/* ── Card: Time & Currency ── */}
        <SectionCard
          icon={<Clock size={18} />}
          title="Time &amp; Currency"
          description="Timezone and numeric format settings"
        >
          <Field label="Timezone" error={errors.timezone}>
            {editing ? (
              <select
                className={`profile-select ${errors.timezone ? "input-error" : ""}`}
                value={draft.timezone}
                onChange={(e) => handleChange("timezone", e.target.value)}
                aria-invalid={!!errors.timezone}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className="profile-value">
                {TIMEZONES.find((tz) => tz.value === saved.timezone)?.label ||
                  saved.timezone}
              </p>
            )}
          </Field>

          <Field label="Currency format" error={errors.currencyFormat}>
            {editing ? (
              <select
                className={`profile-select ${errors.currencyFormat ? "input-error" : ""}`}
                value={draft.currencyFormat}
                onChange={(e) => handleChange("currencyFormat", e.target.value)}
                aria-invalid={!!errors.currencyFormat}
              >
                {CURRENCY_FORMATS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <div className="profile-value currency-preview">
                <DollarSign size={14} />
                {CURRENCY_FORMATS.find((c) => c.value === saved.currencyFormat)
                  ?.label || saved.currencyFormat}
                <span className="currency-sample">
                  Sample: {currencySymbols[saved.currencyFormat] ?? ""}1,234.56
                </span>
              </div>
            )}
          </Field>
        </SectionCard>

        {/* ── Sticky action row ── */}
        {editing && (
          <div
            className="profile-action-row"
            role="group"
            aria-label="Save or cancel changes"
          >
            <span className={`dirty-indicator ${isDirty ? "visible" : ""}`}>
              Unsaved changes
            </span>
            <div className="action-btns">
              <button
                className="btn-ghost"
                onClick={handleCancel}
                disabled={saving}
              >
                <X size={15} />
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save size={15} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ── Layout ── */
        .profile-page {
          max-width: 680px;
          margin: 0 auto;
          padding: 32px 24px 160px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ── Page header ── */
        .profile-page-header {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }
        .profile-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: linear-gradient(135deg, #0f766e, #38bdf8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          letter-spacing: 0.02em;
        }
        .profile-page-title {
          font-size: 22px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 2px;
          letter-spacing: -0.02em;
        }
        .profile-page-subtitle {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .profile-page-header .btn-secondary {
          margin-left: auto;
        }

        /* ── Breadcrumb ── */
        .profile-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #475569;
          margin-top: -8px;
        }
        .profile-breadcrumb .active {
          color: #38bdf8;
        }

        /* ── Banners ── */
        .banner {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.5;
          border: 1px solid;
        }
        .banner-error {
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.3);
          color: #fca5a5;
        }
        .banner-error svg { color: #ef4444; flex-shrink: 0; margin-top: 1px; }
        .banner-error strong { display: block; color: #f87171; margin-bottom: 4px; }
        .banner-error ul { margin: 0; padding-left: 16px; }
        .banner-success {
          background: rgba(16, 185, 129, 0.08);
          border-color: rgba(16, 185, 129, 0.3);
          color: #6ee7b7;
        }
        .banner-success svg { color: #10b981; flex-shrink: 0; }

        /* ── Card ── */
        .profile-card {
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 14px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .profile-card:hover {
          border-color: rgba(148, 163, 184, 0.18);
        }
        .profile-card-header {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.07);
        }
        .profile-card-icon {
          width: 34px;
          height: 34px;
          border-radius: 8px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #38bdf8;
          flex-shrink: 0;
        }
        .profile-card-title {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0 0 2px;
        }
        .profile-card-desc {
          font-size: 12px;
          color: #64748b;
          margin: 0;
        }
        .profile-card-body {
          padding: 20px 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        /* ── Fields ── */
        .profile-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .profile-label {
          font-size: 12px;
          font-weight: 500;
          color: #94a3b8;
          letter-spacing: 0.03em;
          text-transform: uppercase;
        }
        .profile-value {
          font-size: 14px;
          color: #e2e8f0;
          padding: 9px 0;
          margin: 0;
        }
        .currency-preview {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .currency-sample {
          margin-left: 8px;
          font-size: 12px;
          color: #10b981;
          background: rgba(16, 185, 129, 0.08);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .placeholder-text {
          color: #475569;
          font-style: italic;
        }
        .profile-input,
        .profile-select {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 10px 14px;
          color: #e2e8f0;
          font-size: 14px;
          width: 100%;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
          appearance: auto;
        }
        .profile-input:focus,
        .profile-select:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }
        .input-error {
          border-color: rgba(239, 68, 68, 0.6) !important;
        }
        .input-error:focus {
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12) !important;
        }
        .profile-error-inline {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #f87171;
        }

        /* ── Action row ── */
        .profile-action-row {
          position: sticky;
          bottom: 24px;
          background: rgba(2, 6, 23, 0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 12px;
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          z-index: 50;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        .dirty-indicator {
          font-size: 12px;
          color: #f59e0b;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .dirty-indicator.visible { opacity: 1; }
        .action-btns {
          display: flex;
          gap: 10px;
          margin-left: auto;
        }

        /* ── Buttons ── */
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 20px;
          background: linear-gradient(135deg, #0f766e, #0891b2);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: opacity 0.15s, transform 0.1s;
        }
        .btn-primary:hover:not(:disabled) { opacity: 0.9; }
        .btn-primary:active:not(:disabled) { transform: scale(0.98); }
        .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          background: rgba(148, 163, 184, 0.08);
          color: #94a3b8;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(148, 163, 184, 0.18);
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-secondary:hover { background: rgba(148, 163, 184, 0.14); color: #e2e8f0; }

        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 9px 16px;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(100, 116, 139, 0.25);
          border-radius: 8px;
          cursor: pointer;
          transition: color 0.15s, border-color 0.15s;
        }
        .btn-ghost:hover:not(:disabled) { color: #e2e8f0; border-color: rgba(100,116,139,0.5); }
        .btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }

        /* ── Spinner ── */
        .spinner {
          display: inline-block;
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.65s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive ── */
        @media (max-width: 520px) {
          .profile-page { padding: 24px 16px 140px; }
          .profile-card-header { padding: 16px 16px 12px; }
          .profile-card-body { padding: 16px; }
          .profile-page-header .btn-secondary { width: 100%; justify-content: center; }
          .profile-action-row { flex-direction: column; align-items: stretch; }
          .action-btns { flex-direction: column; }
        }
      `}</style>
    </>
  );
}
