import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import {
  clearOnboardingState,
  isOnboardingCompleted,
  loadOnboardingState,
  saveOnboardingState
} from './onboarding-state';

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

  it('reports completion correctly', () => {
    saveOnboardingState({ completed: true, lastStep: 2, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), true);

    saveOnboardingState({ completed: false, lastStep: 1, timestamp: 1680000000000 });
    assert.strictEqual(isOnboardingCompleted(), false);
  });
});
