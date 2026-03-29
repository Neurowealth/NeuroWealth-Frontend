'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

interface StrategyOverviewStepProps {
  onNext: () => void;
  onSkip: () => void;
  onBack?: () => void;
}

const strategies = [
  {
    id: 'conservative',
    name: 'Conservative',
    description: 'Lower risk, steady returns',
    risk: 'Low',
    expectedReturn: '5-8% annually',
    features: ['Stable assets', 'Low volatility', 'Capital preservation'],
    recommended: false
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Moderate risk with growth potential',
    risk: 'Medium',
    expectedReturn: '8-15% annually',
    features: ['Diversified portfolio', 'Regular rebalancing', 'Growth & income'],
    recommended: true
  },
  {
    id: 'aggressive',
    name: 'Aggressive',
    description: 'Higher risk for maximum returns',
    risk: 'High',
    expectedReturn: '15-25% annually',
    features: ['High-growth assets', 'Active management', 'Maximum upside'],
    recommended: false
  }
];

const riskColors = {
  Low: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  High: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function StrategyOverviewStep({ onNext, onSkip, onBack }: StrategyOverviewStepProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>('balanced');
  const [isSaving, setIsSaving] = useState(false);

  const handleContinue = async () => {
    setIsSaving(true);
    
    try {
      // Simulate saving strategy preference
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Save to localStorage for persistence
      localStorage.setItem('user-strategy', selectedStrategy);
      
      onNext();
    } catch (error) {
      console.error('Failed to save strategy:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Investment Strategy</h2>
        <p className="text-slate-400 max-w-md mx-auto">
          Select a strategy that matches your risk tolerance and financial goals. You can change this anytime.
        </p>
      </div>

      {/* Strategy Cards */}
      <div className="grid gap-4 max-w-4xl mx-auto">
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            className={`
              relative border-2 rounded-xl p-5 cursor-pointer transition-all duration-200
              ${selectedStrategy === strategy.id 
                ? 'border-green-500 bg-green-500/10' 
                : 'border-white/10 bg-white/5 hover:bg-white/10'
              }
            `}
            onClick={() => setSelectedStrategy(strategy.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelectedStrategy(strategy.id);
              }
            }}
          >
            {strategy.recommended && (
              <div className="absolute top-3 right-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                  Recommended
                </span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded border ${riskColors[strategy.risk as keyof typeof riskColors]}`}>
                    {strategy.risk} Risk
                  </span>
                </div>
                <p className="text-slate-400 mb-3">{strategy.description}</p>
                
                <div className="mb-3">
                  <span className="text-sm font-medium text-green-400">
                    Expected: {strategy.expectedReturn}
                  </span>
                </div>
                
                <div className="space-y-1">
                  {strategy.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex-shrink-0">
                <div className="w-6 h-6 rounded-full border-2 border-slate-400 flex items-center justify-center">
                  {selectedStrategy === strategy.id && (
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Strategy Details */}
      <div className="max-w-4xl mx-auto">
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="font-medium text-white mb-1">Strategy Information</h4>
              <p className="text-sm text-slate-300">
                Your chosen strategy will determine how your funds are allocated across different assets. 
                You can adjust your strategy or switch to a different one at any time from your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-4xl mx-auto">
        <Button
          onClick={handleContinue}
          disabled={isSaving}
          className="flex-1 sm:flex-initial min-w-[140px]"
        >
          {isSaving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : (
            'Continue with Strategy'
          )}
        </Button>
        
        <Button variant="secondary" onClick={onSkip}>
          Decide Later
        </Button>
      </div>

      {/* Additional Info */}
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-sm text-slate-400">
          Not sure which strategy to choose?{' '}
          <button className="text-green-400 hover:text-green-300 underline">
            Take our risk assessment quiz
          </button>
        </p>
      </div>
    </div>
  );
}
