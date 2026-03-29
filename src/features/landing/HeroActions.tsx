"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/contexts";

export function HeroActions() {
  const { messages } = useI18n();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  async function connectWallet() {
    setLoading(true);
    setError(null);
    try {
      const freighter = await import("@stellar/freighter-api");
      const isConnected = await freighter.isConnected();
      if (!isConnected) {
        setError(messages.heroActions.errorNoWallet);
        return;
      }
      await freighter.getAddress();
      setConnected(true);
    } catch {
      setError(messages.heroActions.errorFailedConnect);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3">
        {connected ? (
          <Link href="/dashboard">
            <Button size="lg">{messages.heroActions.openDashboardArrow}</Button>
          </Link>
        ) : (
          <Button size="lg" onClick={connectWallet} disabled={loading}>
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
