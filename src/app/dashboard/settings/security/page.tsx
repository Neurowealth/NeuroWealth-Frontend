"use client";

import { useState, useEffect } from "react";
import { Lock, Shield, AlertCircle, CheckCircle2, Save, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { mockAudit } from "@/lib/mock-audit";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";

interface SecurityData {
  twoFactorEnabled: boolean;
  lastPasswordChange: string;
  loginAlerts: boolean;
}

const STORAGE_KEY = "nw_security";
const DEFAULT: SecurityData = {
  twoFactorEnabled: false,
  lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  loginAlerts: true,
};

export default function SecurityPage() {
  const [saved, setSaved] = useState<SecurityData>(DEFAULT);
  const [draft, setDraft] = useState<SecurityData>(DEFAULT);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
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
      mockAudit.logEvent("settings_change", { section: "security", changes: draft });
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
      mockAudit.logEvent("password_change", { timestamp: new Date().toISOString() });
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
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
    <div className="security-page">
      <div className="settings-header">
        <div>
          <h1 className="settings-title">Security</h1>
          <p className="settings-subtitle">Manage your account security and authentication</p>
        </div>
      </div>

      {status === "success" && (
        <div className="settings-banner settings-banner-success" role="status">
          <CheckCircle2 size={16} />
          <span>Security settings updated successfully</span>
        </div>
      )}

      {status === "error" && (
        <div className="settings-banner settings-banner-error" role="alert">
          <AlertCircle size={16} />
          <span>Failed to update security settings. Please try again.</span>
        </div>
      )}

      {/* Password Section */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Password</h2>
            <p className="settings-card-desc">Change your account password</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label className="settings-label">Last Changed</label>
            <p className="settings-value">
              {lastPasswordChangeDate.toLocaleDateString()} ({daysSinceChange} days ago)
            </p>
            {daysSinceChange > 90 && (
              <p className="settings-warning">
                <AlertCircle size={14} />
                Consider changing your password regularly for security
              </p>
            )}
          </div>

          <Button
            onClick={() => setShowPasswordModal(true)}
            variant="secondary"
            size="md"
            disabled={saving}
          >
            Change Password
          </Button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <Shield size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Two-Factor Authentication</h2>
            <p className="settings-card-desc">Add an extra layer of security to your account</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="2fa" className="settings-toggle-label">
              <input
                id="2fa"
                type="checkbox"
                checked={draft.twoFactorEnabled}
                onChange={(e) => setDraft({ ...draft, twoFactorEnabled: e.target.checked })}
                className="settings-toggle"
                disabled={!editing}
              />
              <span>Enable two-factor authentication</span>
            </label>
            <p className="settings-hint">
              {draft.twoFactorEnabled
                ? "2FA is enabled. You'll need to verify with your authenticator app on login."
                : "2FA is disabled. Enable it for enhanced security."}
            </p>
          </div>
        </div>
      </div>

      {/* Login Alerts */}
      <div className="settings-card">
        <div className="settings-card-header">
          <div className="settings-card-icon">
            <AlertCircle size={18} />
          </div>
          <div>
            <h2 className="settings-card-title">Login Alerts</h2>
            <p className="settings-card-desc">Get notified of new login attempts</p>
          </div>
        </div>

        <div className="settings-card-body">
          <div className="settings-field">
            <label htmlFor="alerts" className="settings-toggle-label">
              <input
                id="alerts"
                type="checkbox"
                checked={draft.loginAlerts}
                onChange={(e) => setDraft({ ...draft, loginAlerts: e.target.checked })}
                className="settings-toggle"
                disabled={!editing}
              />
              <span>Notify me of new login attempts</span>
            </label>
            <p className="settings-hint">
              {draft.loginAlerts
                ? "You'll receive email notifications for new login attempts."
                : "Login alerts are disabled."}
            </p>
          </div>
        </div>
      </div>

      {!editing && (
        <Button onClick={() => setEditing(true)} variant="secondary" size="md">
          Edit Security Settings
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="modal-close"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-field">
                <label htmlFor="new-password" className="modal-label">
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="modal-input"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="modal-footer">
              <Button
                onClick={() => setShowPasswordModal(false)}
                variant="ghost"
                size="md"
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleChangePassword}
                size="md"
                disabled={saving || !newPassword}
                aria-busy={saving}
              >
                {saving ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .security-page {
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

        .settings-warning {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #f59e0b;
          margin: 8px 0 0;
          padding: 8px 12px;
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 6px;
        }

        .settings-toggle-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          color: #e2e8f0;
          cursor: pointer;
        }

        .settings-toggle {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: #38bdf8;
        }

        .settings-toggle:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .settings-hint {
          font-size: 12px;
          color: #94a3b8;
          margin: 4px 0 0;
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

        /* Modal */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 50;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 14px;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.1);
        }

        .modal-title {
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
          margin: 0;
        }

        .modal-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
          transition: color 0.2s;
        }

        .modal-close:hover {
          color: #e2e8f0;
        }

        .modal-body {
          padding: 20px 24px;
        }

        .modal-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .modal-label {
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .modal-input {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(148, 163, 184, 0.2);
          border-radius: 8px;
          padding: 10px 14px;
          min-height: 44px;
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }

        .modal-input:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.12);
        }

        .modal-footer {
          display: flex;
          gap: 10px;
          padding: 16px 24px;
          border-top: 1px solid rgba(148, 163, 184, 0.1);
          justify-content: flex-end;
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

          .modal-content {
            margin: 16px;
          }
        }
      `}</style>
    </div>
  );
}
