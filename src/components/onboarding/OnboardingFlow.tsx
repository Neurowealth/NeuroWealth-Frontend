'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import OnboardingStepper from './OnboardingStepper';
import WalletConnectStep from './steps/WalletConnectStep';
import StrategyOverviewStep from './steps/StrategyOverviewStep';
import FirstDepositStep from './steps/FirstDepositStep';

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

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'wallet',
    title: 'Connect Wallet',
    description: 'Secure your account',
    component: WalletConnectStep
  },
  {
    id: 'strategy',
    title: 'Choose Strategy',
    description: 'Set your preferences',
    component: StrategyOverviewStep
  },
  {
    id: 'deposit',
    title: 'Make Deposit',
    description: 'Start investing',
    component: FirstDepositStep
  }
];

interface OnboardingFlowProps {
  onComplete?: () => void;
  onSkip?: () => void;
  initialStep?: number;
}

export default function OnboardingFlow({ 
  onComplete, 
  onSkip, 
  initialStep = 0 
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isCompleted, setIsCompleted] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('onboarding-state');
    if (savedState) {
      try {
        const { completed, lastStep } = JSON.parse(savedState);
        if (completed) {
          setIsCompleted(true);
        } else if (lastStep !== undefined) {
          setCurrentStep(lastStep);
        }
      } catch (error) {
        console.error('Failed to load onboarding state:', error);
      }
    }
  }, []);

  // Save state to localStorage
  const saveState = (step: number, completed: boolean = false) => {
    try {
      localStorage.setItem('onboarding-state', JSON.stringify({
        lastStep: step,
        completed,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Failed to save onboarding state:', error);
    }
  };

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      saveState(nextStep);
    } else {
      // Complete onboarding
      setIsCompleted(true);
      saveState(currentStep, true);
      onComplete?.();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      saveState(prevStep);
    }
  };

  const handleSkip = () => {
    setIsCompleted(true);
    saveState(currentStep, true);
    onSkip?.();
  };

  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep + 1) {
      setCurrentStep(stepIndex);
      saveState(stepIndex);
    }
  };

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
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to NeuroWealth!</h2>
            <p className="text-slate-400 mb-6">
              You&apos;ve successfully completed the onboarding process. You&apos;re all set to start your investment journey.
            </p>
            <div className="space-y-3">
              <Button onClick={onComplete} className="w-full">
                Go to Dashboard
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsCompleted(false);
                  setCurrentStep(0);
                  saveState(0, false);
                }}
                className="w-full"
              >
                Review Onboarding
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
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Get Started with NeuroWealth</h1>
          <p className="text-slate-400">
            Complete these simple steps to set up your investment account
          </p>
        </div>

        {/* Stepper */}
        <OnboardingStepper
          steps={onboardingSteps}
          currentStep={currentStep}
          onStepClick={handleStepClick}
        />

        {/* Current Step Content */}
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

          {/* Navigation Footer */}
          <div className="flex justify-between items-center mt-6 px-4">
            <div>
              {currentStep > 0 && (
                <Button variant="ghost" onClick={handleBack}>
                  ← Back
                </Button>
              )}
            </div>
            
            <div className="text-sm text-slate-400">
              Step {currentStep + 1} of {onboardingSteps.length}
            </div>
            
            <div>
              <Button variant="ghost" onClick={handleSkip}>
                Skip All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
