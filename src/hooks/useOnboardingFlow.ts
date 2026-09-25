'use client';

// #335 — onboarding state machine extracted from OnboardingFlow.
// The hook owns step navigation, persistence, and completion logic so the
// presentation component stays free of orchestration concerns.

import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '@/lib/storage-keys';

const STORAGE_KEY = STORAGE_KEYS.ONBOARDING_STATE;

interface OnboardingState {
  currentStep: number;
  isCompleted: boolean;
}

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
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const { completed, lastStep } = JSON.parse(raw) as { completed?: boolean; lastStep?: number };
      if (completed) {
        setIsCompleted(true);
      } else if (typeof lastStep === 'number') {
        setCurrentStep(lastStep);
      }
    } catch {
      // ignore corrupt storage
    }
  }, []);

  function persist(step: number, completed = false) {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lastStep: step, completed, timestamp: Date.now() }),
      );
    } catch {
      // ignore storage errors
    }
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

  function handleStepClick(stepIndex: number) {
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
      persist(stepIndex);
    }
  }

  function resetFlow() {
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
    handleStepClick,
    resetFlow,
  };
}
