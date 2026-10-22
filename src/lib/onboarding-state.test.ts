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
    globalThis.localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, '{ invalid json');
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('returns null when stored state has no boolean completed flag', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify({ lastStep: 1 }));
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('clears onboarding state from localStorage', () => {
    saveOnboardingState({ completed: true, timestamp: 1680000000000 });
    clearOnboardingState();
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('reports completion correctly', () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), true);

    saveOnboardingState({ completed: false, lastStep: 1, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), false);
  });

  // #954 — one reset clears everything onboarding wrote, so "Review Onboarding"
  // and the settings reset button cannot leave stale step-scoped records behind.
  it('clears flow progress and step-scoped records on reset', () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1680000000000 });
    globalThis.localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, 'balanced');
    globalThis.localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT,
      JSON.stringify({ amount: '250' }),
    );

    resetOnboardingState();

    assert.strictEqual(globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE), null);
    assert.strictEqual(globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY), null);
    assert.strictEqual(globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT), null);
    assert.strictEqual(loadOnboardingState(), null);
  });

  it('leaves unrelated storage keys untouched on reset', () => {
    globalThis.localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
    globalThis.localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, 'balanced');

    resetOnboardingState();

    assert.strictEqual(globalThis.localStorage.getItem(STORAGE_KEYS.THEME), 'dark');
    assert.strictEqual(globalThis.localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY), null);
  });
});
