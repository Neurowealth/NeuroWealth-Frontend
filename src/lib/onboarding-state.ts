import { STORAGE_KEYS } from '@/lib/storage-keys';
import { logger } from '@/lib/logger';

export interface OnboardingState {
  completed: boolean;
  lastStep?: number;
  timestamp?: number;
}

const STORAGE_KEY = STORAGE_KEYS.ONBOARDING_STATE;

function getStorage(): Storage | null {
  return globalThis.localStorage ?? null;
}

export function loadOnboardingState(): OnboardingState | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const state = JSON.parse(raw);
    if (typeof state.completed !== 'boolean') {
      return null;
    }

    return state;
  } catch {
    return null;
  }
}

export function saveOnboardingState(state: OnboardingState): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    logger.error('Failed to save onboarding state:', error);
  }
}

export function clearOnboardingState(): void {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEY);
}

/**
 * Clear every key written during onboarding: the flow progress plus the
 * step-scoped strategy / first-deposit records (#954).
 *
 * Both reset entry points — `useOnboardingFlow().resetFlow` ("Review
 * Onboarding") and the OnboardingSettings reset button — call this single
 * function so the two reset paths cannot drift apart again.
 */
export function resetOnboardingState(): void {
  clearOnboardingState();

  const storage = getStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY);
  storage.removeItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT);
}

export function isOnboardingCompleted(): boolean {
  return loadOnboardingState()?.completed === true;
}
