'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/notifications/ToastProvider';
import { clearOnboardingState, loadOnboardingState as getOnboardingState } from '@/lib/onboarding-state';
import { logger } from '@/lib/logger';
import { formatDate } from '@/lib/formatters';
import { STORAGE_KEYS } from '@/lib/storage-keys';
import { useI18n } from '@/contexts/I18nContext';

interface OnboardingState {
  completed: boolean;
  lastStep?: number;
  timestamp?: number;
}

export default function OnboardingSettings() {
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const { pushToast } = useToast();
  const { messages } = useI18n();
  const t = messages.settings.onboarding;

  const fetchOnboardingState = useCallback(() => {
    try {
      const state = getOnboardingState();
      setOnboardingState(state);
    } catch (error) {
      logger.error('Failed to load onboarding state:', error);
    }
  }, []);

  useEffect(() => {
    fetchOnboardingState();
  }, [fetchOnboardingState]);

  const handleResetOnboarding = async () => {
    if (!confirm(t.confirmReset)) {
      return;
    }

    setIsResetting(true);
    
    try {
      // Clear onboarding state
      clearOnboardingState();
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_USER_STRATEGY);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_FIRST_DEPOSIT);
      
      // Reset state
      setOnboardingState(null);
      
      // Wait a moment for visual feedback
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to onboarding
      globalThis.location.href = '/onboarding';
    } catch (error) {
      logger.error('Failed to reset onboarding:', error);
      pushToast({
        title: t.toastFailTitle,
        description: t.toastFailDesc,
        variant: 'error',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleReviewOnboarding = () => {
    // Allow review without resetting
    globalThis.location.href = '/onboarding';
  };

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">{t.title}</h3>
          <p className="text-slate-400 text-sm">
            {t.subtitle}
          </p>
        </div>

        {/* Current Status */}
        <div className="p-4 bg-white/5 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-slate-300">{t.statusLabel}</span>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              onboardingState?.completed
                ? 'bg-green-500/20 text-green-400'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {onboardingState?.completed ? t.statusCompleted : t.statusInProgress}
            </span>
          </div>

          {onboardingState && (
            <div className="space-y-2 text-sm">
              {onboardingState.lastStep !== undefined && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.lastStepLabel}</span>
                  <span className="text-white">
                    {t.lastStepValue.replace('{{step}}', String(onboardingState.lastStep + 1))}
                  </span>
                </div>
              )}
              {onboardingState.timestamp && (
                <div className="flex justify-between">
                  <span className="text-slate-400">{t.completedLabel}</span>
                  <span className="text-white">
                    {formatDate(new Date(onboardingState.timestamp))}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-white mb-2">{t.actionsTitle}</h4>
            <div className="space-y-2">
              {onboardingState?.completed && (
                <Button
                  variant="secondary"
                  onClick={handleReviewOnboarding}
                  className="w-full justify-start"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {t.reviewAction}
                </Button>
              )}

              <Button
                onClick={handleResetOnboarding}
                disabled={isResetting}
                className="w-full justify-start"
              >
                {isResetting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t.resetting}
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {t.resetAction}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Help Text */}
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-xs text-slate-300">
                <p className="mb-1">
                  <strong>{t.helpReviewLabel}</strong> {t.helpReviewDesc}
                </p>
                <p>
                  <strong>{t.helpResetLabel}</strong> {t.helpResetDesc}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
