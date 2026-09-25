import type { OnboardingState } from '@/lib/onboarding-state';

export function getOnboardingProgressWidth(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 1) {
    return 100;
  }

  return (currentStep / (totalSteps - 1)) * 100;
}

export function isOnboardingStepClickable(stepIndex: number, currentStep: number): boolean {
  return stepIndex <= currentStep + 1;
}

export function resolveOnboardingState(savedState: OnboardingState | null, initialStep: number) {
  if (savedState?.completed) {
    return {
      currentStep: initialStep,
      isCompleted: true
    };
  }

  return {
    currentStep: typeof savedState?.lastStep === 'number' ? savedState.lastStep : initialStep,
    isCompleted: false
  };
}
