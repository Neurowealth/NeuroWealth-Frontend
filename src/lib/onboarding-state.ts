import { STORAGE_KEYS } from '@/lib/storage-keys';
import { logger } from '@/lib/logger';

export interface OnboardingState {
  completed: boolean;
  lastStep?: number;
  timestamp?: number;
}

const STORAGE_KEY = STORAGE_KEYS.ONBOARDING_STATE;
// Legacy key used by older code paths (kept for migration/backwards compatibility)
const LEGACY_KEY = 'onboarding-state';

function getStorage(): Storage | null {
  return globalThis.localStorage ?? null;
}

export function loadOnboardingState(): OnboardingState | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  let raw = storage.getItem(STORAGE_KEY);
  // Fallback to legacy key for existing installs
  if (!raw) {
    raw = storage.getItem(LEGACY_KEY) ?? null;
  }
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
    // Always write to canonical key; keep legacy key untouched to avoid surprising deletes
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
 * Clears every localStorage record the onboarding flow writes: the flow state
 * (owned by clearOnboardingState) plus the step-scoped strategy/deposit blobs
 * written by StrategyOverviewStep/FirstDepositStep.
 *
 * Both reset entry points — "Review Onboarding" in OnboardingFlow and "Reset
 * onboarding" in OnboardingSettings — call this single helper so the two paths
 * can no longer drift apart (see #954).
 */
export function resetOnboardingState(): void {
  try {
    clearOnboardingState();

    const storage = getStorage();
    storage?.removeItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY);
    storage?.removeItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT);
  } catch (error) {
    logger.error('Failed to reset onboarding state:', error);
  }
}

export function isOnboardingCompleted(): boolean {
  return loadOnboardingState()?.completed === true;
}
