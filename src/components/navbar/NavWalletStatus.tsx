"use client";

import { useWallet, useWalletConfig } from "@/contexts";
import { Badge } from "@/components/ui/Badge";
import { NetworkMismatchWarning } from "@/components/wallet/NetworkMismatchWarning";
import { truncateWalletAddress } from "@/lib/user";

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
        <Badge
          variant={networkStatus.hasMismatch ? "warning" : "info"}
          className="font-semibold tracking-wide"
        >
          {networkLabel}
        </Badge>
        <Badge variant="success" className="gap-2 font-mono">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {truncateWalletAddress(publicKey)}
        </Badge>
      </div>
      {networkStatus.hasMismatch && (
        <NetworkMismatchWarning status={networkStatus} className="max-w-sm" />
      )}
    </div>
  );
}
