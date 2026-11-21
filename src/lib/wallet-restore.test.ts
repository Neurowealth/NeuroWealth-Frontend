/**
 * Tests for the wallet restore flow used by WalletProvider's mount effect.
 *
 * The provider's `isRestoring` flag flips false exactly once — after
 * `attemptWalletRestore` resolves — regardless of which outcome branch fires.
 * The tests below assert on the *outcome*, which is what the provider then
 * applies to React state. Together they cover the three scenarios called out
 * in the linked issue: isRestoring termination, successful reconnect, and the
 * empty-account (Horizon 404) case.
 */

import assert from "node:assert/strict";
import test from "node:test";

import { setupDomGlobals } from "@/test-setup";
import { LEGACY_WALLET_STORAGE_KEYS, STORAGE_KEYS } from "@/lib/storage-keys";
import {
  clearPersistedWalletState,
  migrateLegacyWalletStorage,
  persistWalletState,
  readPersistedWalletState,
  type PersistedWalletState,
} from "@/lib/wallet-persistence";
import {
  attemptWalletRestore,
  type Balance,
  type WalletRestoreDeps,
  type WalletRestoreOutcome,
} from "@/lib/wallet-restore";
setupDomGlobals();

const NETWORK = "Test SDF Network ; September 2015";

const SAVED: PersistedWalletState = {
  connected: true,
  providerId: "freighter",
  publicKey: "GCKFBEIYTKP4LL6BRC2CKM6V5GU4DZWXG6ULPYDLY3PCMQNJ7TS5C53Q",
  displayName: "Freighter",
};

const OTHER_BALANCE: Balance = {
  balance: "100.0000000",
  asset_type: "native",
};

type Spy<TArgs extends unknown[], TResult> = ((...args: TArgs) => TResult) & {
  calls: TArgs[];
};

function spy<TArgs extends unknown[], TResult>(
  impl: (...args: TArgs) => TResult,
): Spy<TArgs, TResult> {
  const fn = ((...args: TArgs) => {
    fn.calls.push(args);
    return impl(...args);
  }) as Spy<TArgs, TResult>;
  fn.calls = [];
  return fn;
}

interface Harness {
  deps: WalletRestoreDeps;
  spies: {
    persist: Spy<[PersistedWalletState], void>;
    clear: Spy<[], void>;
    resolveKitAddress: Spy<[string], Promise<string>>;
    loadBalances: Spy<[string], Promise<Balance[]>>;
  };
}

function buildHarness(overrides: Partial<WalletRestoreDeps> = {}): Harness {
  const persist = spy((_state: PersistedWalletState) => {});
  const clear = spy(() => {});
  const resolveKitAddress = spy(
    async (_id: string): Promise<string> => SAVED.publicKey,
  );
  const loadBalances = spy(
    async (_pk: string): Promise<Balance[]> => [OTHER_BALANCE],
  );

  const deps: WalletRestoreDeps = {
    readPersisted: () => SAVED,
    resolveKitAddress,
    loadBalances,
    persist,
    clear,
    networkPassphrase: NETWORK,
    ...overrides,
  };

  return { deps, spies: { persist, clear, resolveKitAddress, loadBalances } };
}

// ── isRestoring termination ────────────────────────────────────────────────
// The provider's `isRestoring` is set to false in a finally-like step after
// `attemptWalletRestore` resolves. We assert resolution for each branch so the
// flag is guaranteed to flip even on the unhappy paths.

test("wallet-restore: resolves (no throw) when no persisted state exists — isRestoring terminates", async () => {
  const { deps, spies } = buildHarness({ readPersisted: () => null });

  const outcome: WalletRestoreOutcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "no-persisted-state");
  assert.equal(spies.resolveKitAddress.calls.length, 0);
  assert.equal(spies.loadBalances.calls.length, 0);
  assert.equal(spies.clear.calls.length, 0);
  assert.equal(spies.persist.calls.length, 0);
});

test("wallet-restore: resolves (no throw) when kit getAddress throws — isRestoring terminates and persistence is cleared", async () => {
  const kitError = new Error("kit unavailable");
  const { deps, spies } = buildHarness({
    resolveKitAddress: spy(async (_id: string) => {
      throw kitError;
    }),
  });

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "kit-error");
  if (outcome.kind === "kit-error") {
    assert.equal(outcome.error, kitError);
  }
  assert.equal(spies.clear.calls.length, 1);
  assert.equal(spies.persist.calls.length, 0);
  assert.equal(spies.loadBalances.calls.length, 0);
});

// ── reconnect ──────────────────────────────────────────────────────────────

test("wallet-restore: persisted address matches kit → restored with balances + persistence refreshed", async () => {
  const { deps, spies } = buildHarness();

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "restored");
  if (outcome.kind === "restored") {
    assert.equal(outcome.publicKey, SAVED.publicKey);
    assert.equal(outcome.providerId, SAVED.providerId);
    assert.equal(outcome.displayName, SAVED.displayName);
    assert.deepEqual(outcome.balances, [OTHER_BALANCE]);
    assert.equal(outcome.accountNotFound, false);
  }

  // Persistence refreshed once with the current network passphrase
  assert.equal(spies.persist.calls.length, 1);
  assert.equal(spies.persist.calls[0][0].networkPassphrase, NETWORK);
  assert.equal(spies.persist.calls[0][0].publicKey, SAVED.publicKey);

  // Persistence not cleared on the happy path
  assert.equal(spies.clear.calls.length, 0);
});

test("wallet-restore: kit returns a different address than persisted → mismatch and persistence cleared", async () => {
  const otherAddress =
    "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJUWDA";
  const { deps, spies } = buildHarness({
    resolveKitAddress: spy(async (_id: string) => otherAddress),
  });

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "address-mismatch");
  assert.equal(spies.clear.calls.length, 1);
  assert.equal(spies.persist.calls.length, 0);
  assert.equal(spies.loadBalances.calls.length, 0);
});

// ── empty-account (Horizon 404) ────────────────────────────────────────────

test("wallet-restore: Horizon returns 404 on loadBalances → restored with accountNotFound=true and empty balances", async () => {
  const horizon404 = Object.assign(new Error("Not Found"), {
    response: { status: 404 },
  });

  const { deps, spies } = buildHarness({
    loadBalances: spy(async (_pk: string): Promise<Balance[]> => {
      throw horizon404;
    }),
  });

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "restored");
  if (outcome.kind === "restored") {
    assert.equal(outcome.publicKey, SAVED.publicKey);
    assert.equal(outcome.accountNotFound, true);
    assert.deepEqual(outcome.balances, []);
  }

  // Persistence is refreshed even when the account isn't funded yet —
  // the reconnect itself succeeded; only the balance fetch came back empty.
  assert.equal(spies.persist.calls.length, 1);
  assert.equal(spies.clear.calls.length, 0);
});

test("wallet-restore: non-404 balance error → restored with accountNotFound=false and empty balances", async () => {
  const networkError = Object.assign(new Error("Bad Gateway"), {
    response: { status: 502 },
  });

  const { deps, spies } = buildHarness({
    loadBalances: spy(async (_pk: string): Promise<Balance[]> => {
      throw networkError;
    }),
  });

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "restored");
  if (outcome.kind === "restored") {
    assert.equal(outcome.accountNotFound, false);
    assert.deepEqual(outcome.balances, []);
  }
  assert.equal(spies.clear.calls.length, 0);
});

test("wallet-restore: balance loader rejects with a plain Error (no .response) → still resolves to restored with empty balances", async () => {
  const { deps } = buildHarness({
    loadBalances: spy(async (_pk: string): Promise<Balance[]> => {
      throw new Error("plain error without a response field");
    }),
  });

  const outcome = await attemptWalletRestore(deps);

  assert.equal(outcome.kind, "restored");
  if (outcome.kind === "restored") {
    assert.equal(outcome.accountNotFound, false);
    assert.deepEqual(outcome.balances, []);
  }
});

// ── legacy wallet persistence migration ────────────────────────────────────

function setLegacyWalletStorage(values: {
  connected: string;
  provider?: string;
  publicKey?: string;
  displayName?: string;
}): void {
  localStorage.setItem(LEGACY_WALLET_STORAGE_KEYS.CONNECTED, values.connected);
  if (values.provider) {
    localStorage.setItem(LEGACY_WALLET_STORAGE_KEYS.PROVIDER, values.provider);
  }
  if (values.publicKey) {
    localStorage.setItem(LEGACY_WALLET_STORAGE_KEYS.PUBLIC_KEY, values.publicKey);
  }
  if (values.displayName) {
    localStorage.setItem(LEGACY_WALLET_STORAGE_KEYS.DISPLAY_NAME, values.displayName);
  }
}

function assertLegacyWalletKeysRemoved(): void {
  for (const key of Object.values(LEGACY_WALLET_STORAGE_KEYS)) {
    assert.equal(localStorage.getItem(key), null, `legacy key ${key} should be removed`);
  }
}

test.beforeEach(() => {
  localStorage.clear();
});

test("legacy migration: connected=true copies all available wallet values", () => {
  setLegacyWalletStorage({
    connected: "true",
    provider: "freighter",
    publicKey: SAVED.publicKey,
    displayName: "Freighter",
  });

  migrateLegacyWalletStorage();

  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED), "true");
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PROVIDER), "freighter");
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PUBLIC_KEY), SAVED.publicKey);
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_DISPLAY_NAME), "Freighter");
  assertLegacyWalletKeysRemoved();
});

test("legacy migration: connected=false does not create persisted wallet state", () => {
  setLegacyWalletStorage({
    connected: "false",
    provider: "freighter",
    publicKey: SAVED.publicKey,
    displayName: "Freighter",
  });

  migrateLegacyWalletStorage();

  assert.equal(readPersistedWalletState(), null);
  assertLegacyWalletKeysRemoved();
});

test("legacy migration: missing public key does not create persisted wallet state", () => {
  setLegacyWalletStorage({
    connected: "true",
    provider: "freighter",
    displayName: "Freighter",
  });

  migrateLegacyWalletStorage();

  assert.equal(readPersistedWalletState(), null);
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED), null);
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PROVIDER), null);
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PUBLIC_KEY), null);
  assertLegacyWalletKeysRemoved();
});

test("legacy migration: existing central keys short-circuit and are not overwritten", () => {
  localStorage.setItem(STORAGE_KEYS.WALLET_CONNECTED, "true");
  localStorage.setItem(STORAGE_KEYS.WALLET_PROVIDER, "central-provider");
  localStorage.setItem(STORAGE_KEYS.WALLET_PUBLIC_KEY, "central-public-key");
  setLegacyWalletStorage({
    connected: "true",
    provider: "legacy-provider",
    publicKey: "legacy-public-key",
    displayName: "Legacy",
  });

  migrateLegacyWalletStorage();

  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_CONNECTED), "true");
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PROVIDER), "central-provider");
  assert.equal(localStorage.getItem(STORAGE_KEYS.WALLET_PUBLIC_KEY), "central-public-key");
  assertLegacyWalletKeysRemoved();
});

test("wallet persistence: persist/read/clear round-trip", () => {
  const state: PersistedWalletState = {
    connected: true,
    providerId: "freighter",
    publicKey: SAVED.publicKey,
    displayName: "Freighter",
    networkPassphrase: NETWORK,
  };

  persistWalletState(state);

  assert.deepEqual(readPersistedWalletState(), state);

  clearPersistedWalletState();

  assert.equal(readPersistedWalletState(), null);
  assertLegacyWalletKeysRemoved();
  for (const key of [
    STORAGE_KEYS.WALLET_CONNECTED,
    STORAGE_KEYS.WALLET_PROVIDER,
    STORAGE_KEYS.WALLET_PUBLIC_KEY,
    STORAGE_KEYS.WALLET_DISPLAY_NAME,
    STORAGE_KEYS.WALLET_NETWORK,
  ]) {
    assert.equal(localStorage.getItem(key), null, `central key ${key} should be cleared`);
  }
});
