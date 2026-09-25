import {
  LEGACY_WALLET_STORAGE_KEYS,
  STORAGE_KEYS,
} from "@/lib/storage-keys";

/**
 * Persists only public wallet metadata (public key, provider id, display
 * name) in localStorage. This is non-sensitive — a Stellar public key is
 * safe to expose — so no encryption key is required. Private keys/signing
 * never pass through this module; wallet providers (Freighter, etc.) hold
 * those and sign in the browser extension, not here.
 */

export interface PersistedWalletState {
  connected: boolean;
  providerId: string;
  publicKey: string;
  displayName: string;
  networkPassphrase?: string;
}

function readKey(key: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(key);
}

function writeKey(key: string, value: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, value);
}

function removeKey(key: string): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(key);
}

/**
 * One-time migration from pre-centralization stellar_wallet_* keys.
 */
export function migrateLegacyWalletStorage(): void {
  if (typeof window === "undefined") return;

  const hasNewKeys = readKey(STORAGE_KEYS.WALLET_CONNECTED) !== null;
  const legacyConnected = readKey(LEGACY_WALLET_STORAGE_KEYS.CONNECTED);
  if (hasNewKeys || legacyConnected === null) return;

  const providerId = readKey(LEGACY_WALLET_STORAGE_KEYS.PROVIDER);
  const publicKey = readKey(LEGACY_WALLET_STORAGE_KEYS.PUBLIC_KEY);
  const displayName = readKey(LEGACY_WALLET_STORAGE_KEYS.DISPLAY_NAME);

  if (legacyConnected === "true" && providerId && publicKey) {
    writeKey(STORAGE_KEYS.WALLET_CONNECTED, "true");
    writeKey(STORAGE_KEYS.WALLET_PROVIDER, providerId);
    writeKey(STORAGE_KEYS.WALLET_PUBLIC_KEY, publicKey);
    if (displayName) {
      writeKey(STORAGE_KEYS.WALLET_DISPLAY_NAME, displayName);
    }
  }

  removeKey(LEGACY_WALLET_STORAGE_KEYS.CONNECTED);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.PROVIDER);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.PUBLIC_KEY);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.DISPLAY_NAME);
}

export function readPersistedWalletState(): PersistedWalletState | null {
  migrateLegacyWalletStorage();

  const connected = readKey(STORAGE_KEYS.WALLET_CONNECTED);
  const providerId = readKey(STORAGE_KEYS.WALLET_PROVIDER);
  const publicKey = readKey(STORAGE_KEYS.WALLET_PUBLIC_KEY);
  const displayName = readKey(STORAGE_KEYS.WALLET_DISPLAY_NAME);
  const networkPassphrase =
    readKey(STORAGE_KEYS.WALLET_NETWORK) ?? undefined;

  if (connected !== "true" || !providerId || !publicKey) {
    return null;
  }

  return {
    connected: true,
    providerId,
    publicKey,
    displayName: displayName ?? "Unknown",
    networkPassphrase,
  };
}

export function persistWalletState(state: PersistedWalletState): void {
  writeKey(STORAGE_KEYS.WALLET_CONNECTED, state.connected ? "true" : "false");
  writeKey(STORAGE_KEYS.WALLET_PROVIDER, state.providerId);
  writeKey(STORAGE_KEYS.WALLET_PUBLIC_KEY, state.publicKey);
  writeKey(STORAGE_KEYS.WALLET_DISPLAY_NAME, state.displayName);
  if (state.networkPassphrase) {
    writeKey(STORAGE_KEYS.WALLET_NETWORK, state.networkPassphrase);
  }
}

export function clearPersistedWalletState(): void {
  removeKey(STORAGE_KEYS.WALLET_CONNECTED);
  removeKey(STORAGE_KEYS.WALLET_PROVIDER);
  removeKey(STORAGE_KEYS.WALLET_PUBLIC_KEY);
  removeKey(STORAGE_KEYS.WALLET_DISPLAY_NAME);
  removeKey(STORAGE_KEYS.WALLET_NETWORK);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.CONNECTED);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.PROVIDER);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.PUBLIC_KEY);
  removeKey(LEGACY_WALLET_STORAGE_KEYS.DISPLAY_NAME);
}
