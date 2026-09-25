/**
 * Pure restore logic extracted from `WalletProvider` so the on-mount reconnect
 * flow is testable without React. The provider calls `attemptWalletRestore`
 * inside its mount effect and renders one of the result shapes below.
 *
 * The function does not touch React state or DOM globals directly — every
 * external interaction goes through the injected `deps`, which makes the
 * three branches the linked issue cares about (`isRestoring` finishing,
 * successful reconnect, empty-account 404) deterministic to test.
 */
import type { PersistedWalletState } from "@/lib/wallet-persistence";

/** Horizon account balance entry (subset we render). */
export interface Balance {
  balance: string;
  asset_type: string;
  asset_code?: string;
  asset_issuer?: string;
}

export type WalletRestoreOutcome =
  /** Nothing persisted — provider should flip `isRestoring` → false and stay disconnected. */
  | { kind: "no-persisted-state" }
  /** Persisted wallet matched the kit's current address; balances loaded. */
  | {
      kind: "restored";
      publicKey: string;
      displayName: string;
      providerId: string;
      balances: Balance[];
      /** True when Horizon returned 404 (account exists in wallet but not funded). */
      accountNotFound: boolean;
    }
  /** Persisted state present, but the kit returned a different address — drop persistence. */
  | { kind: "address-mismatch" }
  /** Any unexpected throw from kit/server — drop persistence and stay disconnected. */
  | { kind: "kit-error"; error: unknown };

export interface WalletRestoreDeps {
  readPersisted: () => PersistedWalletState | null;
  /** Configure kit with the saved provider id and return the current address. */
  resolveKitAddress: (providerId: string) => Promise<string>;
  /** Fetch account balances. May throw with `response.status === 404` for empty accounts. */
  loadBalances: (publicKey: string) => Promise<Balance[]>;
  /** Persist updated state (re-saves with the current network passphrase). */
  persist: (state: PersistedWalletState) => void;
  /** Clear persisted state. */
  clear: () => void;
  /** Active network passphrase, written back into persisted state on success. */
  networkPassphrase: string;
}

function isHorizon404(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("response" in error)) return false;
  const status = (error as { response?: { status?: number } }).response?.status;
  return status === 404;
}

export async function attemptWalletRestore(
  deps: WalletRestoreDeps,
): Promise<WalletRestoreOutcome> {
  const saved = deps.readPersisted();
  if (!saved) {
    return { kind: "no-persisted-state" };
  }

  let address: string;
  try {
    address = await deps.resolveKitAddress(saved.providerId);
  } catch (error) {
    deps.clear();
    return { kind: "kit-error", error };
  }

  if (address !== saved.publicKey) {
    deps.clear();
    return { kind: "address-mismatch" };
  }

  deps.persist({
    ...saved,
    networkPassphrase: deps.networkPassphrase,
  });

  try {
    const balances = await deps.loadBalances(address);
    return {
      kind: "restored",
      publicKey: address,
      displayName: saved.displayName,
      providerId: saved.providerId,
      balances,
      accountNotFound: false,
    };
  } catch (error) {
    return {
      kind: "restored",
      publicKey: address,
      displayName: saved.displayName,
      providerId: saved.providerId,
      balances: [],
      accountNotFound: isHorizon404(error),
    };
  }
}
