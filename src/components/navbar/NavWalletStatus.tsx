'use client';

import { useWallet, useWalletConfig } from "@/contexts";
import { NetworkMismatchWarning } from "@/components/wallet/NetworkMismatchWarning";

function truncateAddress(address: string) {
  if (!address || address.length < 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatNetworkLabel(network?: string) {
  if (!network) return "UNKNOWN";
  const normalized = network.toLowerCase();
  if (normalized.includes("test")) return "TESTNET";
  if (normalized.includes("public")) return "PUBLIC";
  return network;
}

export function NavWalletStatus() {
  const { connected, isRestoring, publicKey, networkStatus } = useWallet();
  const config = useWalletConfig();
  const networkLabel = formatNetworkLabel(config?.network);

  if (isRestoring || !connected || !publicKey) return null;

  return (
    <div className="hidden sm:flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold tracking-wide ${
            networkStatus.hasMismatch
              ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
              : "border-cyan-500/30 bg-cyan-500/10 text-cyan-300"
          }`}
        >
          {networkLabel}
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-mono text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          {truncateAddress(publicKey)}
        </span>
      </div>
      {networkStatus.hasMismatch && (
        <NetworkMismatchWarning status={networkStatus} className="max-w-sm" />
      )}
    </div>
  );
}
