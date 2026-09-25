"use client";

import { useWallet } from "@/contexts";
import { WalletStatusBadge } from "./WalletStatusBadge";
import { WalletIcon, LockIcon, LinkIcon } from "./wallet-icons";

/**
 * WalletConnectionStates
 *
 * Displays comprehensive wallet connection UI states:
 * - Disconnected: Call-to-action to connect
 * - Restoring: Loading state during auto-reconnect
 * - Connected: Status badge with address and network
 * - Network Mismatch: Warning when wallet network ≠ app network
 */

interface WalletConnectionStatesProps {
  showDetails?: boolean;
  compact?: boolean;
}

export function WalletConnectionStates({
  showDetails = true,
  compact = false,
}: WalletConnectionStatesProps) {
  const { connected, isRestoring, publicKey, walletName, networkStatus } =
    useWallet();

  if (compact && connected) {
    return <WalletStatusBadge size="sm" compact showNetwork={false} />;
  }

  if (isRestoring) {
    return (
      <div
        className="rounded-lg border border-surface-border bg-surface p-4 space-y-3"
        data-qa="wallet-state-restoring"
        role="status"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <div className="animate-pulse">
            <WalletIcon className="w-5 h-5 text-text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-text-primary">
              Checking wallet connection...
            </p>
            <p className="text-xs text-text-muted mt-0.5">
              Restoring your previous session
            </p>
          </div>
        </div>
        <div className="h-2 bg-surface-elevated rounded-full overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-pulse" />
        </div>
      </div>
    );
  }

  if (connected) {
    return (
      <div 
        className="space-y-3" 
        data-qa="wallet-state-connected"
        role="status"
        aria-live="polite"
      >
        <WalletStatusBadge showNetwork={showDetails} />

        {showDetails && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
            <div className="flex items-start gap-2">
              <LinkIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-blue-900 uppercase">
                  Connected
                </p>
                <p className="text-sm text-blue-800 mt-1">
                  Your wallet is connected and ready for transactions.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Disconnected state
  return (
    <div
      className="rounded-lg border border-surface-border bg-surface p-4 space-y-4"
      data-qa="wallet-state-disconnected"
      role="status"
      aria-live="polite"
    >
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <LockIcon className="w-5 h-5 text-text-secondary" />
          <h3 className="text-sm font-semibold text-text-primary">
            Wallet Not Connected
          </h3>
        </div>
        <p className="text-sm text-text-secondary">
          Connect your Stellar wallet to access investment strategies and manage
          your portfolio.
        </p>
      </div>

      {showDetails && (
        <div className="space-y-2 pt-2 border-t border-surface-border">
          <p className="text-xs font-medium text-text-muted uppercase">
            Benefits:
          </p>
          <ul className="space-y-1.5 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span>View AI-powered portfolio insights</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span>Execute automated investment strategies</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold mt-0.5">✓</span>
              <span>Track transactions and balances</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * WalletRequiredGuard
 *
 * Gate component for displaying content only when wallet is connected
 */
interface WalletRequiredGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function WalletRequiredGuard({
  children,
  fallback,
}: WalletRequiredGuardProps) {
  const { connected, isRestoring } = useWallet();

  if (isRestoring) {
    return (
      <div className="rounded-lg border border-surface-border bg-surface p-4 text-center">
        <div className="animate-pulse">
          <p className="text-sm text-text-secondary">Loading wallet status...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div
        className="rounded-lg border border-amber-200 bg-amber-50 p-4"
        data-qa="wallet-required-guard"
      >
        <div className="flex items-start gap-3">
          <LockIcon className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-amber-900">
              Wallet Connection Required
            </h4>
            <p className="text-sm text-amber-800 mt-1">
              This action requires your wallet to be connected. Please connect
              your wallet to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
