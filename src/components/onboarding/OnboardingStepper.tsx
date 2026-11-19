'use client';

import { getOnboardingProgressWidth, isOnboardingStepClickable } from './onboarding-utils';

interface Step {
  id: string;
  title: string;
  description: string;
}

interface OnboardingStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
}

export default function OnboardingStepper({ steps, currentStep, onStepClick }: OnboardingStepperProps) {
  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          {/* Background Line */}
          <div className="absolute left-0 top-1/2 h-0.5 w-full -translate-y-1/2 bg-slate-200 dark:bg-white/10" />
          
          {/* Progress Line */}
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ width: `${getOnboardingProgressWidth(currentStep, steps.length)}%` }}
          />
          
          {/* Step Indicators */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && isOnboardingStepClickable(index, currentStep);
            
            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick(index)}
                  disabled={!isClickable}
                  className={`
                    relative w-10 h-10 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                    ${isCompleted 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : isCurrent 
                        ? 'border-green-500 bg-white text-slate-900 dark:text-dark-900'
                        : 'border-slate-300 bg-slate-100 text-slate-500 dark:border-white/20 dark:bg-dark-800 dark:text-slate-400'
                    }
                    ${isClickable ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed'}
                  `}
                  aria-label={`Go to step ${index + 1}: ${step.title}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </button>
                
                {/* Step Label */}
                <div className="absolute top-12 text-center">
                  <p className={`text-sm font-medium ${
                    isCurrent
                      ? 'text-slate-900 dark:text-white'
                      : isCompleted
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="mt-1 hidden max-w-24 text-xs text-slate-500 dark:text-slate-400 sm:block">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Mobile Step Counter */}
      <div className="md:hidden text-center mb-6">
        <span className="text-sm text-slate-600 dark:text-slate-400" aria-live="polite">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>
    </div>
  );
}
