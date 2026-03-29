'use client';

import { Card } from '@/components/ui/Card';
import OnboardingSettings from '@/components/settings/OnboardingSettings';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">
            Manage your account settings and preferences.
          </p>
        </div>

        <div className="space-y-6">
          <OnboardingSettings />
          
          {/* Additional settings sections can be added here  */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">More Settings</h3>
              <p className="text-slate-400 text-sm">
                Additional settings and preferences will be available soon.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
