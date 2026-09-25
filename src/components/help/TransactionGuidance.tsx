'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useI18n } from '@/contexts/I18nContext';

interface Issue {
  id: string;
  title: string;
  description: string;
  symptoms: string[];
  solutions: string[];
  preventive: string[];
  severity: 'low' | 'medium' | 'high';
}


const severityColors = {
  low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-red-500/20 text-red-400 border-red-500/30'
};

interface TransactionGuidanceProps {
  /** Opens the Help Center's Contact Support tab. */
  onContactSupport?: () => void;
}

export default function TransactionGuidance({ onContactSupport }: TransactionGuidanceProps = {}) {
  const { messages } = useI18n();
  const t = messages.help.guidance;
  const transactionIssues: Issue[] = t.issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    symptoms: issue.symptoms,
    solutions: issue.solutions,
    preventive: issue.preventive,
    severity: issue.severity,
  }));
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'symptoms' | 'solutions' | 'preventive' | null>(null);

  const selectedIssueData = transactionIssues.find(issue => issue.id === selectedIssue);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-3">{t.title}</h2>
          <p className="text-slate-400">
            {t.subtitle}
          </p>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Issues List */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">{t.commonIssues}</h3>
          {transactionIssues.map((issue) => (
            <Card
              key={issue.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedIssue === issue.id
                  ? 'ring-2 ring-green-500 bg-green-500/5'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => setSelectedIssue(issue.id)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-white flex-1">{issue.title}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${severityColors[issue.severity]}`}>
                  {t.severity[issue.severity]}
                </span>
              </div>
              <p className="text-sm text-slate-400">{issue.description}</p>
            </Card>
          ))}
        </div>

        {/* Detailed View */}
        <div className="lg:col-span-2">
          {selectedIssueData ? (
            <div className="space-y-6">
              <Card>
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">{selectedIssueData.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${severityColors[selectedIssueData.severity]}`}>
                    {t.priority.replace('{severity}', t.severity[selectedIssueData.severity].toUpperCase())}
                  </span>
                </div>
                <p className="text-slate-300 mb-6">{selectedIssueData.description}</p>

                {/* Symptoms */}
                <div className="mb-6">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'symptoms' ? null : 'symptoms')}
                    className="w-full flex items-center justify-between text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-expanded={expandedSection === 'symptoms'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <span className="font-medium text-white">{t.symptoms}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedSection === 'symptoms' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSection === 'symptoms' && (
                    <div className="mt-3 pl-11">
                      <ul className="space-y-2">
                        {selectedIssueData.symptoms.map((symptom, index) => (
                          <li key={`symptom-${index}`} className="flex items-start gap-2 text-slate-300">
                            <span className="text-yellow-400 mt-1">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Solutions */}
                <div className="mb-6">
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'solutions' ? null : 'solutions')}
                    className="w-full flex items-center justify-between text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-expanded={expandedSection === 'solutions'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium text-white">{t.solutions}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedSection === 'solutions' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSection === 'solutions' && (
                    <div className="mt-3 pl-11">
                      <ol className="space-y-3">
                        {selectedIssueData.solutions.map((solution, index) => (
                          <li key={`solution-${index}`} className="flex items-start gap-3 text-slate-300">
                            <span className="flex-shrink-0 w-6 h-6 bg-green-500/20 rounded-full flex items-center justify-center text-xs text-green-400 font-medium">
                              {index + 1}
                            </span>
                            <span>{solution}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>

                {/* Preventive Measures */}
                <div>
                  <button
                    onClick={() => setExpandedSection(expandedSection === 'preventive' ? null : 'preventive')}
                    className="w-full flex items-center justify-between text-left p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    aria-expanded={expandedSection === 'preventive'}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <span className="font-medium text-white">{t.prevention}</span>
                    </div>
                    <svg
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        expandedSection === 'preventive' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSection === 'preventive' && (
                    <div className="mt-3 pl-11">
                      <ul className="space-y-2">
                        {selectedIssueData.preventive.map((measure, index) => (
                          <li key={`preventive-${index}`} className="flex items-start gap-2 text-slate-300">
                            <span className="text-blue-400 mt-1">•</span>
                            <span>{measure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Actions */}
              <Card>
                <h4 className="font-semibold text-white mb-4">{t.quickActions}</h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  <Button variant="secondary" onClick={() => globalThis.open('https://stellar.expert/', '_blank')}>
                    {t.checkStatus}
                  </Button>
                  <Button variant="secondary" onClick={() => globalThis.open('https://status.stellar.org/', '_blank')}>
                    {t.networkStatus}
                  </Button>
                  <Button variant="ghost" onClick={() => setSelectedIssue(null)}>
                    {t.backToAll}
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      if (onContactSupport) {
                        onContactSupport();
                      } else {
                        globalThis.location.assign('/dashboard/help');
                      }
                    }}
                  >
                    {t.contactSupport}
                  </Button>
                </div>
              </Card>
            </div>
          ) : (
            <Card>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">{t.selectIssue}</h3>
                <p className="text-slate-400">
                  {t.selectIssueHint}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Emergency Help */}
      <Card className="border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-2">{t.emergencyTitle}</h4>
            <p className="text-slate-300 mb-3">
              {t.emergencyBody}
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" className="border-red-500/40 text-red-400 hover:bg-red-500/10">
                {t.emergencySupport}
              </Button>
              <Button variant="ghost" onClick={() => globalThis.open('mailto:emergency@neurowealth.com')}>
                {t.emailEmergency}
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
