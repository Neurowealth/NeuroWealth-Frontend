'use client';

// #335 — presentation only. Step orchestration lives in useOnboardingFlow.

import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import OnboardingStepper from './OnboardingStepper';
import WalletConnectStep from './steps/WalletConnectStep';
import StrategyOverviewStep from './steps/StrategyOverviewStep';
import FirstDepositStep from './steps/FirstDepositStep';
import { useOnboardingFlow } from '@/hooks/useOnboardingFlow';
import { useI18n } from '@/contexts/I18nContext';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<{
    onNext: () => void;
    onSkip: () => void;
    onBack?: () => void;
  }>;
}

// Non-translatable step config — titles/descriptions are sourced from i18n messages.
const stepConfig = [
  { id: 'wallet', component: WalletConnectStep },
  { id: 'strategy', component: StrategyOverviewStep },
  { id: 'deposit', component: FirstDepositStep },
] as const;

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
  initialStep?: number;
}

export default function OnboardingFlow({
  onComplete,
  onSkip,
  initialStep = 0,
}: OnboardingFlowProps) {
  const {
    currentStep,
    isCompleted,
    handleNext,
    handleBack,
    handleSkip,
    handleStepClick,
    resetFlow,
  } = useOnboardingFlow({
    totalSteps: stepConfig.length,
    initialStep,
    onComplete,
    onSkip,
  });

  const { messages } = useI18n();
  const flowMessages = messages.onboardingFlow;

  const onboardingSteps: OnboardingStep[] = [
    { ...stepConfig[0], ...flowMessages.steps.wallet },
    { ...stepConfig[1], ...flowMessages.steps.strategy },
    { ...stepConfig[2], ...flowMessages.steps.deposit },
  ];

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Move focus to the step heading when step changes
    if (stepHeadingRef.current && !isCompleted) {
      stepHeadingRef.current.focus();
    }
  }, [currentStep, isCompleted]);

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <div className="py-8">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{flowMessages.completion.title}</h2>
            <p className="text-slate-400 mb-6">
              {flowMessages.completion.description}
            </p>
            <div className="space-y-3">
              <Button onClick={onComplete} className="w-full">
                {flowMessages.completion.goToDashboard}
              </Button>
              <Button variant="ghost" onClick={resetFlow} className="w-full">
                {flowMessages.completion.reviewOnboarding}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const CurrentStepComponent = onboardingSteps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{flowMessages.heading}</h1>
          <p className="text-slate-400">
            {flowMessages.subtitle}
          </p>
        </div>

        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="sr-only"
        >
          {onboardingSteps[currentStep].title}
        </h2>

        <OnboardingStepper
          steps={onboardingSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden">
            <div className="p-6 sm:p-8">
              <CurrentStepComponent
                onNext={handleNext}
                onSkip={handleSkip}
                onBack={currentStep > 0 ? handleBack : undefined}
              />
            </div>
          </Card>

          <div className="flex justify-between items-center mt-6 px-4">
            <div>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handleBack}>
                  ← {flowMessages.back}
                </Button>
              )}
            </div>

            <div className="text-sm text-slate-400" aria-live="polite">
              {flowMessages.stepProgress
                .replace('{current}', String(currentStep + 1))
                .replace('{total}', String(onboardingSteps.length))}
            </div>

            <div>
              <Button variant="ghost" onClick={handleSkip}>
                {flowMessages.skipAll}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
