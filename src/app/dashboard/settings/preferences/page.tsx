"use client";

import {
  Globe,
  Clock,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Sun,
  Moon,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";
import { ThemeMode, useTheme } from "@/contexts/ThemeProvider";
import { useI18n } from "@/contexts/I18nContext";
import { LOCALE_OPTIONS as LOCALES } from "@/lib/locale-options";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import styles from "../settings.module.css";

interface PreferencesData {
  locale: string;
  timezone: string;
  currencyFormat: string;
  theme: ThemeMode;
}

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

const STORAGE_KEY = STORAGE_KEYS.PREFERENCES;
const DEFAULT: PreferencesData = {
  locale: "en-US",
  timezone: "UTC",
  currencyFormat: "USD",
  theme: "system",
};

export default function PreferencesPage() {
  const { messages } = useI18n();
  const { setTheme: setAppTheme } = useTheme();
  const t = messages.settings.preferences;
  const {
    saved,
    draft,
    setDraft,
    editing,
    setEditing,
    saving,
    status,
    pageLoading,
    isDirty,
    handleSave,
    handleCancel: revertForm,
  } = useSettingsForm<PreferencesData>(STORAGE_KEY, DEFAULT, {
    auditSection: "preferences",
    onSaveSuccess: (savedData) => {
      setAppTheme(savedData.theme);
    },
  });

  // Live-preview: swatches apply the theme immediately via setAppTheme.
  // Cancel must revert both the draft form state and the applied theme
  // back to the last-saved value so an un-saved preview never sticks.
  const handleCancel = () => {
    revertForm();
    setAppTheme(saved.theme);
  };

  const handleThemeOptionChange = (theme: ThemeMode) => {
    setDraft({ ...draft, theme });
    setAppTheme(theme);
  };

  if (pageLoading) {
    return <SettingsSectionSkeleton rows={3} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.settingsHeader}>
        <div>
          <h1 className={styles.settingsTitle}>{t.title}</h1>
          <p className={styles.settingsSubtitle}>{t.subtitle}</p>
        </div>
      </div>

      {status === "success" && (
        <div className={`${styles.settingsBanner} ${styles.settingsBannerSuccess}`} role="status">
          <CheckCircle2 size={16} />
          <span>{t.savedSuccess}</span>
        </div>
      )}

      {status === "error" && (
        <div className={`${styles.settingsBanner} ${styles.settingsBannerError}`} role="alert">
          <AlertCircle size={16} />
          <span>{t.saveError}</span>
        </div>
      )}

      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <Globe size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.localisation.title}</h2>
            <p className={styles.settingsCardDesc}>{t.localisation.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <label htmlFor="locale" className={styles.settingsLabel}>
              {t.localisation.localeLabel}
            </label>
            {editing ? (
              <select
                id="locale"
                value={draft.locale}
                onChange={(e) => setDraft({ ...draft, locale: e.target.value })}
                className={styles.settingsSelect}
              >
                {LOCALES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.settingsValue}>
                {LOCALES.find((l) => l.value === saved.locale)?.label ||
                  saved.locale}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <Monitor size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.appearance.title}</h2>
            <p className={styles.settingsCardDesc}>{t.appearance.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <label className={styles.settingsLabel}>{t.appearance.themeLabel}</label>
            {editing ? (
              <div className={styles.themeOptions}>
                <button
                  type="button"
                  onClick={() => handleThemeOptionChange("light")}
                  className={`${styles.themeOption} ${draft.theme === "light" ? styles.themeOptionActive : ""}`}
                  aria-pressed={draft.theme === "light"}
                >
                  <Sun size={16} />
                  <span>{t.appearance.light}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeOptionChange("dark")}
                  className={`${styles.themeOption} ${draft.theme === "dark" ? styles.themeOptionActive : ""}`}
                  aria-pressed={draft.theme === "dark"}
                >
                  <Moon size={16} />
                  <span>{t.appearance.dark}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleThemeOptionChange("system")}
                  className={`${styles.themeOption} ${draft.theme === "system" ? styles.themeOptionActive : ""}`}
                  aria-pressed={draft.theme === "system"}
                >
                  <Monitor size={16} />
                  <span>{t.appearance.system}</span>
                </button>
              </div>
            ) : (
              <p className={styles.settingsValue}>
                {saved.theme === "light" && t.appearance.light}
                {saved.theme === "dark" && t.appearance.dark}
                {saved.theme === "system" && t.appearance.system}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <Clock size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.timeCurrency.title}</h2>
            <p className={styles.settingsCardDesc}>{t.timeCurrency.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <label htmlFor="timezone" className={styles.settingsLabel}>
              {t.timeCurrency.timezoneLabel}
            </label>
            {editing ? (
              <select
                id="timezone"
                value={draft.timezone}
                onChange={(e) =>
                  setDraft({ ...draft, timezone: e.target.value })
                }
                className={styles.settingsSelect}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.settingsValue}>
                {TIMEZONES.find((tz) => tz.value === saved.timezone)?.label ||
                  saved.timezone}
              </p>
            )}
          </div>

          <div className={styles.settingsField}>
            <label htmlFor="currency" className={styles.settingsLabel}>
              {t.timeCurrency.currencyLabel}
            </label>
            {editing ? (
              <select
                id="currency"
                value={draft.currencyFormat}
                onChange={(e) =>
                  setDraft({ ...draft, currencyFormat: e.target.value })
                }
                className={styles.settingsSelect}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            ) : (
              <p className={styles.settingsValue}>
                {CURRENCIES.find((c) => c.value === saved.currencyFormat)
                  ?.label || saved.currencyFormat}
              </p>
            )}
          </div>
        </div>
      </div>

      {!editing && (
        <Button onClick={() => setEditing(true)} variant="secondary" size="md">
          {t.actions.edit}
        </Button>
      )}

      {editing && (
        <div
          className={styles.settingsActionBar}
          role="group"
          aria-label="Save or cancel changes"
        >
          {isDirty && (
            <span className={styles.settingsDirtyIndicator}>
              {t.actions.unsaved}
            </span>
          )}
          <div className={styles.settingsActions}>
            <Button
              onClick={handleCancel}
              variant="ghost"
              size="md"
              disabled={saving}
            >
              <X size={16} />
              {t.actions.cancel}
            </Button>
            <Button
              onClick={handleSave}
              size="md"
              disabled={saving}
              aria-busy={saving}
            >
              {saving ? (
                <>
                  <span className={styles.settingsSpinner} aria-hidden="true" />
                  {t.actions.saving}
                </>
              ) : (
                <>
                  <Save size={16} />
                  {t.actions.save}
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
