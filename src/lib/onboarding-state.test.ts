import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  clearOnboardingState,
  isOnboardingCompleted,
  loadOnboardingState,
  resetOnboardingState,
  saveOnboardingState
} from './onboarding-state';
import { STORAGE_KEYS } from './storage-keys';

function createLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
    clear() {
      store.clear();
    }
  } as Storage;
}

describe('onboarding-state adapter', () => {
  beforeEach(() => {
    globalThis.localStorage = createLocalStorage();
  });

  it('saves and loads onboarding state from localStorage', () => {
    const state = { completed: false, lastStep: 1, timestamp: 1680000000000 };

    saveOnboardingState(state);

    const loaded = loadOnboardingState();
    assert.deepStrictEqual(loaded, state);
  });

  it('returns null when onboarding state is missing', () => {
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('returns null when onboarding state is invalid JSON', () => {
    globalThis.localStorage.setItem('nw_onboarding_state', '{ invalid json');
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('loads from legacy key when canonical key is missing', () => {
    const legacy = { completed: false, lastStep: 1, timestamp: 1680000000000 };
    globalThis.localStorage.setItem('onboarding-state', JSON.stringify(legacy));

    const loaded = loadOnboardingState();
    assert.deepStrictEqual(loaded, legacy);
  });

  it('clears onboarding state from localStorage', () => {
    saveOnboardingState({ completed: true, timestamp: 1680000000000 });
    clearOnboardingState();
    assert.strictEqual(loadOnboardingState(), null);
  });

  // Regression test for issue #954 — the flow reset used to leave the
  // step-scoped strategy/deposit records behind.
  it('resetOnboardingState clears the flow state and the step-scoped records', () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1680000000000 });
    globalThis.localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, 'aggressive');
    globalThis.localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT,
      JSON.stringify({ amount: 250, asset: 'xlm', isFirstDeposit: true }),
    );

    resetOnboardingState();

    assert.strictEqual(loadOnboardingState(), null);
    assert.strictEqual(
      globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY),
      null,
    );
    assert.strictEqual(
      globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT),
      null,
    );
  });

  it('resetOnboardingState is a no-op when the storage is already empty', () => {
    assert.doesNotThrow(() => resetOnboardingState());
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('reports completion correctly', () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), true);

    saveOnboardingState({ completed: false, lastStep: 1, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), false);
  });
});
