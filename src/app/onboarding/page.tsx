'use client';

import { useEffect, useState } from 'react';
import OnboardingFlow from '@/components/onboarding/OnboardingFlow';
import { OnboardingStepSkeleton } from '@/components/ui/Skeleton';

export default function OnboardingPage() {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Check if user has already completed onboarding
    const timer = setTimeout(() => {
      const savedState = localStorage.getItem('onboarding-state');
      if (savedState) {
        try {
          const { completed } = JSON.parse(savedState);
          if (completed) {
            setShouldShowOnboarding(false);
          }
        } catch (error) {
          console.error('Failed to parse onboarding state:', error);
        }
      }
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
        <OnboardingStepSkeleton />
      </div>
    );
  }

  const handleOnboardingComplete = () => {
    // Redirect to dashboard or home page
    window.location.href = '/';
  };

  const handleSkipOnboarding = () => {
    // Mark as completed and redirect
    localStorage.setItem('onboarding-state', JSON.stringify({
      completed: true,
      timestamp: Date.now()
    }));
    handleOnboardingComplete();
  };

  if (!shouldShowOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">
            Onboarding Already Completed
          </h1>
          <p className="text-slate-400 mb-6">
            You&apos;ve already completed the onboarding process.
          </p>
          <button
            onClick={handleOnboardingComplete}
            className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-400 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <OnboardingFlow
      onComplete={handleOnboardingComplete}
      onSkip={handleSkipOnboarding}
    />
  );
}
