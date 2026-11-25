"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n, useWallet } from "@/contexts";

export function HeroActions() {
  const { messages } = useI18n();
  const { connected, connect, isRestoring } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      await connect();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message.includes("not installed") || message.includes("not available")) {
        setError(messages.heroActions.errorNoWallet);
      } else {
        setError(messages.heroActions.errorFailedConnect);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {connected ? (
          <Link href="/dashboard">
            <Button size="lg" data-qa="landing-primary-cta-button">
              {messages.heroActions.openDashboardArrow}
            </Button>
          </Link>
        ) : (
          <Button
            size="lg"
            onClick={connectWallet}
            disabled={loading || isRestoring}
            data-qa="landing-primary-cta-button"
          >
            {loading ? messages.heroActions.connecting : messages.heroActions.connectWallet}
          </Button>
        )}

        {!connected && (
          <Link href="/dashboard">
            <Button variant="secondary" size="lg">
              {messages.heroActions.openDashboard}
            </Button>
          </Link>
        )}

        <Link href="#features">
          <Button variant="ghost" size="lg">
            {messages.heroActions.learnMore}
          </Button>
        </Link>
      </div>

      {error && (
        <p className="text-sm text-red-400" data-qa="landing-connection-error">
          {error}
        </p>
      )}
    </div>
  );
}
