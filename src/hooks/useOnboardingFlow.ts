'use client';

// #335 — onboarding state machine extracted from OnboardingFlow.
// The hook owns step navigation, persistence, and completion logic so the
// presentation component stays free of orchestration concerns.

import { useState, useEffect } from 'react';
import {
  loadOnboardingState,
  resetOnboardingState,
  saveOnboardingState,
} from '@/lib/onboarding-state';

interface UseOnboardingFlowOptions {
  totalSteps: number;
  initialStep?: number;
  onComplete?: () => void;
  onSkip?: () => void;
}

export interface OnboardingFlowControls {
  currentStep: number;
  isCompleted: boolean;
  handleNext: () => void;
  handleBack: () => void;
  handleSkip: () => void;
  handleStepSkip: () => void;
  handleStepClick: (stepIndex: number) => void;
  resetFlow: () => void;
}

export function useOnboardingFlow({
  totalSteps,
  initialStep = 0,
  onComplete,
  onSkip,
}: UseOnboardingFlowOptions): OnboardingFlowControls {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    const saved = loadOnboardingState();
    if (!saved) return;
    if (saved.completed) {
      setIsCompleted(true);
    } else if (typeof saved.lastStep === 'number') {
      setCurrentStep(saved.lastStep);
    }
  }, []);

  function persist(step: number, completed = false) {
    saveOnboardingState({ lastStep: step, completed, timestamp: Date.now() });
  }

  function handleNext() {
    if (currentStep < totalSteps - 1) {
      const next = currentStep + 1;
      setCurrentStep(next);
      persist(next);
    } else {
      setIsCompleted(true);
      persist(currentStep, true);
      onComplete?.();
    }
  }

  function handleBack() {
    if (currentStep > 0) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      persist(prev);
    }
  }

  function handleSkip() {
    setIsCompleted(true);
    persist(currentStep, true);
    onSkip?.();
  }

  // Per-step "Skip for Now" / "Decide Later": same advance/complete path as
  // Next — kept as a named alias so the UI can wire the two actions separately
  // without duplicating the step machine (#1052).
  function handleStepSkip() {
    handleNext();
  }

  function handleStepClick(stepIndex: number) {
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
      persist(stepIndex);
    }
  }

  function resetFlow() {
    // "Review Onboarding" restarts the flow from scratch, so clear the
    // step-scoped strategy/deposit records too — not just the flow progress
    // (#954). Shared with OnboardingSettings' reset button via
    // resetOnboardingState so both paths clear the same keys.
    resetOnboardingState();
    setIsCompleted(false);
    setCurrentStep(0);
    persist(0, false);
  }

  return {
    currentStep,
    isCompleted,
    handleNext,
    handleBack,
    handleSkip,
    handleStepSkip,
    handleStepClick,
    resetFlow,
  };
}
