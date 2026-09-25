"use client";

import React, { useState, useEffect } from "react";
import { ShieldCheck } from "lucide-react";
import { CookieConsentSettings } from "@/components/settings/CookieConsentSettings";
import { useI18n } from "@/contexts/I18nContext";
import { SettingsSectionSkeleton } from "@/components/ui/Skeleton";
import rawStyles from "../settings.module.css";

const styles: Record<string, string> =
  rawStyles ||
  new Proxy({}, {
    get: (_target, prop) => (typeof prop === "string" ? prop : ""),
  });

export const dynamic = "force-dynamic";

export default function PrivacyPage() {
  const { messages } = useI18n();
  const t = messages.settings.privacy;

  // Prevents a hydration flash while the cookie context loads from localStorage.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <SettingsSectionSkeleton rows={2} />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.settingsHeader}>
        <div>
          <h1 className={styles.settingsTitle}>{t.title}</h1>
          <p className={styles.settingsSubtitle}>{t.subtitle}</p>
        </div>
      </div>

      <div className={styles.settingsCard}>
        <div className={styles.settingsCardHeader}>
          <div className={styles.settingsCardIcon}>
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className={styles.settingsCardTitle}>{t.cookieSection.title}</h2>
            <p className={styles.settingsCardDesc}>{t.cookieSection.desc}</p>
          </div>
        </div>

        <div className={styles.settingsCardBody}>
          <CookieConsentSettings />
        </div>
      </div>
    </div>
  );
}
