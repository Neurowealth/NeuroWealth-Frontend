import { Networks } from "@stellar/stellar-sdk";

export type ConfiguredStellarNetwork = "testnet" | "mainnet";

/**
 * Resolves NEXT_PUBLIC_STELLAR_NETWORK to a normalized app network id.
 */
export function getConfiguredStellarNetwork(): ConfiguredStellarNetwork {
  const raw = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
  return raw === "mainnet" || raw === "public" ? "mainnet" : "testnet";
}

export function getConfiguredNetworkPassphrase(): string {
  return getConfiguredStellarNetwork() === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
}

export function formatConfiguredNetworkLabel(): string {
  return getConfiguredStellarNetwork() === "mainnet" ? "PUBLIC" : "TESTNET";
}

export function networkPassphrasesMatch(
  expected: string,
  actual?: string | null,
): boolean {
  if (!actual) return true;
  return expected === actual;
}
