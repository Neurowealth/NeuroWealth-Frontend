import { Suspense } from "react";
import Link from "next/link";
import { Bell, ChevronRight, Globe, LayoutDashboard, Monitor, Palette, Shield, UserRound, Wallet } from "lucide-react";
import SettingsLoading from "./loading";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import OnboardingSettings from "@/components/settings/OnboardingSettings";
import { useI18n } from "@/contexts/I18nContext";

export const dynamic = "force-dynamic";
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
  const { messages } = useI18n();
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface-elevated text-text-muted cursor-not-allowed">{messages.common.comingSoon}</span>
  );
}

function LinkAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-400 hover:text-sky-300 transition-colors"
    >
      {label}
      <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
    </Link>
  );
}

function SettingsContent() {
  const { messages } = useI18n();
  const t = messages.settings.index;
  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{t.title}</h1>
        <p className="mt-1 text-sm text-text-secondary">{t.subtitle}</p>
      </div>

      <SettingsSection title={t.appearance.title} icon={Palette}>
        <SettingsRow
          label={t.appearance.themeTitle}
          description={t.appearance.themeDesc}
          action={<ThemeSettings />}
        />
      </SettingsSection>

      <SettingsSection title={t.profile.title} icon={UserRound}>
        <SettingsRow
          label={t.profile.displayTitle}
          description={t.profile.displayDesc}
          action={<LinkAction href="/profile" label={t.profile.editAction} />}
        />
        <SettingsRow
          label={t.profile.regionTitle}
          description={t.profile.regionDesc}
          action={<LinkAction href="/profile" label={t.profile.openAction} />}
        />
      </SettingsSection>

      <SettingsSection title={t.wallet.title} icon={Wallet}>
        <SettingsRow
          label={t.wallet.connectedTitle}
          description={t.wallet.connectedDesc}
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label={t.wallet.networkTitle}
          description={t.wallet.networkDesc}
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title={t.notifications.title} icon={Bell}>
        <SettingsRow
          label={t.notifications.emailTitle}
          description={t.notifications.emailDesc}
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label={t.notifications.whatsappTitle}
          description={t.notifications.whatsappDesc}
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title={t.security.title} icon={Shield}>
        <SettingsRow
          label={t.security.twoFactorTitle}
          description={t.security.twoFactorDesc}
          action={<ComingSoonBadge />}
        />
        <SettingsRow
          label={t.security.sessionTitle}
          description={t.security.sessionDesc}
          action={<ComingSoonBadge />}
        />
      </SettingsSection>

      <SettingsSection title={t.region.title} icon={Globe}>
        <SettingsRow
          label={t.region.currencyTitle}
          description={t.region.currencyDesc}
          action={<LinkAction href="/profile" label={t.region.openAction} />}
        />
      </SettingsSection>

      <section aria-labelledby="section-onboarding">
        <h2 id="section-onboarding" className="sr-only">Onboarding</h2>
        <OnboardingSettings />
      </section>
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
