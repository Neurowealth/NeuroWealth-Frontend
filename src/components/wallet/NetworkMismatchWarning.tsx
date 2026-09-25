"use client";

import type { WalletNetworkStatus } from "@/lib/wallet-network-detection";

interface NetworkMismatchWarningProps {
  status: WalletNetworkStatus;
  className?: string;
  compact?: boolean;
}

export function NetworkMismatchWarning({
  status,
  className = "",
  compact = false,
}: NetworkMismatchWarningProps) {
  if (!status.hasMismatch) return null;

  const walletLabel = status.walletNetworkLabel ?? "another network";
  const appLabel = status.appNetworkLabel;

  if (compact) {
    return (
      <p
        role="alert"
        className={`text-xs text-amber-300 ${className}`.trim()}
      >
        Wallet is on {walletLabel}; app expects {appLabel}.
      </p>
    );
  }

  return (
    <div
      role="alert"
      className={`rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100 ${className}`.trim()}
    >
      <p className="font-semibold text-amber-200">Network mismatch</p>
      <p className="mt-1 text-amber-100/90">
        Your wallet is set to <span className="font-medium">{walletLabel}</span>,
        but this app is configured for{" "}
        <span className="font-medium">{appLabel}</span> (
        <code className="text-amber-200/80">NEXT_PUBLIC_STELLAR_NETWORK</code>
        ). Switch your wallet network or update the app configuration before
        signing transactions.
      </p>
    </div>
  );
}
