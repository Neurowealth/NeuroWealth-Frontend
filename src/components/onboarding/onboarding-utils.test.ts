import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getOnboardingProgressWidth,
  isOnboardingStepClickable
} from './onboarding-utils';

describe('onboarding stepper utilities', () => {
  it('calculates progress width correctly for each step', () => {
    assert.strictEqual(getOnboardingProgressWidth(0, 3), 0);
    assert.strictEqual(getOnboardingProgressWidth(1, 3), 50);
    assert.strictEqual(getOnboardingProgressWidth(2, 3), 100);
  });

  it('allows users to navigate to completed steps and one step ahead', () => {
    assert.strictEqual(isOnboardingStepClickable(0, 0), true);
    assert.strictEqual(isOnboardingStepClickable(1, 0), true);
    assert.strictEqual(isOnboardingStepClickable(2, 0), false);
    assert.strictEqual(isOnboardingStepClickable(2, 1), true);
  });
});
