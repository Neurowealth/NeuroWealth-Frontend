"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/contexts";
import { connectFreighter } from "@/lib/stellar-wallet-kit";

export function HeroActions() {
  const { messages } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      await connectFreighter();
      setConnected(true);
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
            disabled={loading}
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
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
}
