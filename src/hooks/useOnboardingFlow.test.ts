import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { renderHook, act } from '@/test-utils/render-hook';
import { useOnboardingFlow } from './useOnboardingFlow';
import { STORAGE_KEYS } from '@/lib/storage-keys';

describe('useOnboardingFlow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  // Regression test for issue #954: "Review Onboarding" (resetFlow) must also
  // clear the strategy/deposit records written by the step components.
  it('resetFlow clears the step-scoped strategy and deposit records', () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify({ completed: true, lastStep: 2 }));
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY, 'aggressive');
    localStorage.setItem(
      STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT,
      JSON.stringify({ amount: 250, asset: 'xlm', timestamp: 1680000000000, isFirstDeposit: true }),
    );

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    assert.equal(result.current.isCompleted, true);

    act(() => {
      result.current.resetFlow();
    });

    assert.equal(result.current.isCompleted, false);
    assert.equal(result.current.currentStep, 0);
    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY), null);
    assert.equal(localStorage.getItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT), null);
  });

  it('resetFlow keeps a fresh in-progress state record so steps do not resume at completion', () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify({ completed: true, lastStep: 2 }));

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.resetFlow();
    });

    const raw = localStorage.getItem(STORAGE_KEYS.ONBOARDING_STATE);
    assert.ok(raw, 'resetFlow should persist a fresh onboarding state record');
    const state = JSON.parse(raw) as { lastStep: number; completed: boolean; timestamp: number };
    assert.equal(state.completed, false);
    assert.equal(state.lastStep, 0);
    assert.equal(typeof state.timestamp, 'number');
  });

  it('resetFlow leaves unrelated storage keys untouched', () => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING_STATE, JSON.stringify({ completed: true, lastStep: 2 }));
    localStorage.setItem(STORAGE_KEYS.COOKIE_CONSENT, 'accepted');

    const { result } = renderHook(() => useOnboardingFlow({ totalSteps: 3 }));

    act(() => {
      result.current.resetFlow();
    });

    assert.equal(localStorage.getItem(STORAGE_KEYS.COOKIE_CONSENT), 'accepted');
  });
});
