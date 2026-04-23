import { Suspense } from "react";
import { Bell, Globe, Shield, Wallet } from "lucide-react";
import SettingsLoading from "./loading";

export const metadata = { title: "Settings — NeuroWealth" };

function SettingsRow({
  label,
  description,
  action,
}: {
  label: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-surface-border last:border-0">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-muted mt-0.5">{description}</p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className="card" aria-labelledby={`section-${title}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-text-secondary" aria-hidden="true" />
        <h2
          id={`section-${title}`}
          className="text-sm font-semibold text-text-primary"
        >
          {title}
        </h2>
      </div>
      <div className="border-t border-surface-border mt-3">{children}</div>
    </section>
  );
}

function ComingSoonBadge() {
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-elevated text-text-muted cursor-not-allowed">
      Coming soon
    </span>
  );
}

function SettingsContent() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Manage your account preferences and connected wallet.
        </p>
      </div>

      <SettingsSection title="Wallet" icon={Wallet}>
        <SettingsRow
          label="Connected Wallet"
          description="Freighter wallet connection for signing transactions."
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label="Network"
          description="Switch between Stellar Testnet and Mainnet."
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title="Notifications" icon={Bell}>
        <SettingsRow
          label="Email Alerts"
          description="Receive email notifications for deposits, withdrawals, and rebalances."
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label="WhatsApp Notifications"
          description="Get updates via WhatsApp messaging."
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title="Security" icon={Shield}>
        <SettingsRow
          label="Two-Factor Authentication"
          description="Add an extra layer of security to your account."
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label="Session Management"
          description="View and revoke active sessions."
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title="Region" icon={Globe}>
        <SettingsRow
          label="Currency Display"
          description="Choose your preferred display currency (USD, EUR, GBP)."
          action={<ComingSoonBadge />}
        />
      </SettingsSection>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsContent />
    </Suspense>
  );
}
