'use client';

import { ReactNode } from 'react';

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
          <div className="absolute left-0 top-1/2 h-0.5 bg-white/10 w-full -translate-y-1/2" />
          
          {/* Progress Line */}
          <div 
            className="absolute left-0 top-1/2 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep) / (steps.length - 1)) * 100}%` }}
          />
          
          {/* Step Indicators */}
          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isClickable = onStepClick && (isCompleted || index === currentStep + 1);
            
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
                        ? 'bg-white border-green-500 text-dark-900' 
                        : 'bg-dark-800 border-white/20 text-slate-400'
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
                    isCurrent ? 'text-white' : isCompleted ? 'text-green-400' : 'text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-1 max-w-24 hidden sm:block">
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
        <span className="text-sm text-slate-400">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>
    </div>
  );
}
