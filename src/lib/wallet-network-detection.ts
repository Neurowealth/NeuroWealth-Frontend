
import {
  formatConfiguredNetworkLabel,
  getConfiguredNetworkPassphrase,
  networkPassphrasesMatch,
} from "@/lib/stellar-network";

export interface WalletNetworkStatus {
  hasMismatch: boolean;
  appNetworkLabel: string;
  walletNetworkLabel?: string;
  walletPassphrase?: string;
}

function labelFromPassphrase(passphrase: string): string {
  const lower = passphrase.toLowerCase();
  if (lower.includes("test")) return "TESTNET";
  if (lower.includes("public") || lower.includes("main")) return "PUBLIC";
  return "UNKNOWN";
}

/**
 * Compares the wallet extension network (when available) to NEXT_PUBLIC_STELLAR_NETWORK.
 */
export async function detectWalletNetworkMismatch(
  walletProviderId?: string,
): Promise<WalletNetworkStatus> {
  const expectedPassphrase = getConfiguredNetworkPassphrase();
  const appNetworkLabel = formatConfiguredNetworkLabel();

  const { FREIGHTER_ID, freighterAPI } = await import("@/lib/stellar-wallet-kit");

  if (!walletProviderId || walletProviderId !== FREIGHTER_ID) {
    return {
      hasMismatch: false,
      appNetworkLabel,
    };
  }

  const walletPassphrase = await freighterAPI.getFreighterNetworkPassphrase();
  if (!walletPassphrase) {
    return {
      hasMismatch: false,
      appNetworkLabel,
    };
  }

  const hasMismatch = !networkPassphrasesMatch(
    expectedPassphrase,
    walletPassphrase,
  );

  return {
    hasMismatch,
    appNetworkLabel,
    walletNetworkLabel: labelFromPassphrase(walletPassphrase),
    walletPassphrase,
  };
}
