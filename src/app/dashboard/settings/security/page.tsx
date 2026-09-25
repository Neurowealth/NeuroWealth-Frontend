"use client";

import { useState, useRef } from "react";
import { Lock, Shield, AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";

export const dynamic = "force-dynamic";
import { mockAuditService } from "@/lib/mock-audit";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";
import { useI18n } from "@/contexts/I18nContext";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { useSettingsForm } from "@/hooks/useSettingsForm";
import { logger } from "@/lib/logger";
import styles from "../settings.module.css";

interface SecurityData {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  loginAlerts: boolean;
}

const STORAGE_KEY = STORAGE_KEYS.SECURITY;
const DEFAULT: SecurityData = {
  twoFactorEnabled: false,
  lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  loginAlerts: true,
};

export default function SecurityPage() {
  const { messages } = useI18n();
  const t = messages.settings.security;
  const {
    saved,
    setSaved,
    draft,
    setDraft,
    editing,
    setEditing,
    saving,
    setSaving,
    status,
    setStatus,
    pageLoading,
    isDirty,
    handleSave,
    handleCancel,
  } = useSettingsForm<SecurityData>(STORAGE_KEY, DEFAULT, {
    auditSection: "security",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const passwordModalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(passwordModalRef, showPasswordModal);

  if (pageLoading) {
    return <SettingsSectionSkeleton rows={3} />;
  }

  const handleChangePassword = async () => {
    if (!newPassword) return;
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      const updated = {
        ...draft,
        lastPasswordChange: new Date().toISOString(),
      };
      setDraft(updated);
      setSaved(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setStatus("success");
      setShowPasswordModal(false);
      setNewPassword("");
      mockAuditService.logEvent("password_change", { timestamp: new Date().toISOString() });
      setTimeout(() => setStatus("idle"), 3000);
    } catch (error) {
      logger.error("security_password_change_failed", error);
      setStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const lastPasswordChangeDate = new Date(saved.lastPasswordChange);
  const daysSinceChange = Math.floor(
    (Date.now() - lastPasswordChangeDate.getTime()) / (1000 * 60 * 60 * 24)
  );

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
          <span>{t.banner.success}</span>
        </div>
      )}

      {status === "error" && (
        <div className={`${styles.settingsBanner} ${styles.settingsBannerError}`} role="alert">
          <AlertCircle size={16} />
          <span>{t.banner.error}</span>
        </div>
      )}

      {/* Password Section */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <Lock size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.password.title}</h2>
            <p className={styles.settingsCardDesc}>{t.password.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <label className={styles.settingsLabel}>{t.password.lastChangedLabel}</label>
            <p className={styles.settingsValue}>
              {lastPasswordChangeDate.toLocaleDateString()} ({daysSinceChange} {t.password.daysAgoSuffix})
            </p>
            {daysSinceChange > 90 && (
              <p className={styles.settingsWarning}>
                <AlertCircle size={14} />
                {t.password.warning}
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="secondary"
            size="md"
            disabled={saving}
          >
            {t.password.changeAction}
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <Shield size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.twoFactor.title}</h2>
            <p className={styles.settingsCardDesc}>{t.twoFactor.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <Switch
              id="2fa"
              label={t.twoFactor.enableLabel}
              checked={draft.twoFactorEnabled}
              onChange={(checked) => setDraft({ ...draft, twoFactorEnabled: checked })}
              disabled={!editing}
            />
            <p className={styles.settingsHint}>
              {draft.twoFactorEnabled ? t.twoFactor.enabledHint : t.twoFactor.disabledHint}
            </p>
          </div>
        </div>
      </div>

      {/* Login Alerts */}
      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <AlertCircle size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.loginAlerts.title}</h2>
            <p className={styles.settingsCardDesc}>{t.loginAlerts.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <div className={styles.settingsField}>
            <Switch
              id="alerts"
              label={t.loginAlerts.enableLabel}
              checked={draft.loginAlerts}
              onChange={(checked) => setDraft({ ...draft, loginAlerts: checked })}
              disabled={!editing}
            />
            <p className={styles.settingsHint}>
              {draft.loginAlerts ? t.loginAlerts.enabledHint : t.loginAlerts.disabledHint}
            </p>
          </div>
        </div>
      </div>

      {!editing && (
        <Button onClick={() => setEditing(true)} variant="secondary" size="md">
          {t.actions.edit}
        </Button>
      )}

      {editing && (
        <div className={styles.settingsActionBar} role="group" aria-label="Save or cancel changes">
          {isDirty && <span className={styles.settingsDirtyIndicator}>{t.actions.unsaved}</span>}
          <div className={styles.settingsActions}>
            <Button onClick={handleCancel} variant="ghost" size="md" disabled={saving}>
              <X size={16} />
              {t.actions.cancel}
            </Button>
            <Button onClick={handleSave} size="md" disabled={saving} aria-busy={saving}>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div ref={passwordModalRef} className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>{t.modal.title}</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className={styles.modalClose}
                aria-label={t.modal.closeLabel}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalField}>
                <label htmlFor="new-password" className={styles.modalLabel}>
                  {t.modal.newPasswordLabel}
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t.modal.newPasswordPlaceholder}
                  className={styles.modalInput}
                  disabled={saving}
                />
              </div>
            </div>

            <div className={styles.modalFooter}>
              <Button
                onClick={() => setShowPasswordModal(false)}
                variant="ghost"
                size="md"
                disabled={saving}
              >
                {t.modal.cancel}
              </Button>
              <Button
                onClick={handleChangePassword}
                size="md"
                disabled={saving || !newPassword}
                aria-busy={saving}
              >
                {saving ? t.modal.updating : t.modal.update}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
