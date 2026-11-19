export function getOnboardingProgressWidth(currentStep: number, totalSteps: number): number {
  if (totalSteps <= 1) {
    return 100;
  }

  return (currentStep / (totalSteps - 1)) * 100;
}

export function isOnboardingStepClickable(stepIndex: number, currentStep: number): boolean {
  return stepIndex <= currentStep + 1;
}
