"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { logger } from "@/lib/logger";
import { BugPlay, FlaskConical, RotateCcw, Eye } from "lucide-react";

type ScenarioType = "success" | "empty" | "loading" | "partial-failure" | "timeout";
type ModuleType = "portfolio" | "history" | "transactions" | "notifications";

interface ScenarioState {
  [key: string]: ScenarioType;
}

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  success: "Success",
  empty: "Empty State",
  loading: "Loading",
  "partial-failure": "Partial Failure",
  timeout: "Timeout",
};

const SCENARIO_COLORS: Record<ScenarioType, string> = {
  success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  empty: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  loading: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  "partial-failure": "bg-orange-500/10 text-orange-400 border-orange-500/20",
  timeout: "bg-red-500/10 text-red-400 border-red-500/20",
};

const MODULE_LABELS: Record<ModuleType, string> = {
  portfolio: "Portfolio",
  history: "History",
  transactions: "Transactions",
  notifications: "Notifications",
};

const MODULE_ICONS: Record<ModuleType, string> = {
  portfolio: "📊",
  history: "📜",
  transactions: "💳",
  notifications: "🔔",
};

const SANDBOX_STORAGE_KEY = STORAGE_KEYS.SANDBOX_SCENARIOS;

const DEFAULT_SCENARIOS: ScenarioState = {
  portfolio: "success",
  history: "success",
  transactions: "success",
  notifications: "success",
};

export default function SandboxClientPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioState>(DEFAULT_SCENARIOS);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem(SANDBOX_STORAGE_KEY);
    if (saved) {
      try {
        setScenarios(JSON.parse(saved));
      } catch (e) {
        logger.error("Failed to load sandbox scenarios", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(scenarios));
    }
  }, [scenarios, isClient]);

  const updateScenario = useCallback((module: ModuleType, scenario: ScenarioType) => {
    setScenarios((prev) => ({ ...prev, [module]: scenario }));
  }, []);

  const resetAll = useCallback(() => {
    setScenarios(DEFAULT_SCENARIOS);
  }, []);

  const setAllScenarios = useCallback((scenario: ScenarioType) => {
    setScenarios({
      portfolio: scenario,
      history: scenario,
      transactions: scenario,
      notifications: scenario,
    });
  }, []);

  const navigateToModule = useCallback((module: ModuleType) => {
    router.push(`/dashboard/${module}`);
  }, [router]);

  return (
    <ProtectedRoute>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BugPlay className="w-5 h-5 text-sky-400" aria-hidden="true" />
              <h1 className="text-xl font-bold text-text-primary">QA Sandbox</h1>
            </div>
            <p className="mt-1 text-sm text-text-secondary">
              Toggle mock scenarios globally to test different UI states across modules
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              <FlaskConical className="w-3 h-3" aria-hidden="true" />
              Dev mode
            </span>
            <button
              onClick={resetAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset all
            </button>
          </div>
        </div>

        {/* Scenario Controls — grouped by module */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.keys(MODULE_LABELS) as ModuleType[]).map((module) => (
            <section key={module} className="card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{MODULE_ICONS[module]}</span>
                  <h2 className="text-sm font-semibold text-text-primary">
                    {MODULE_LABELS[module]}
                  </h2>
                </div>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${SCENARIO_COLORS[scenarios[module] as ScenarioType]}`}
                >
                  {SCENARIO_LABELS[scenarios[module] as ScenarioType]}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 mb-3">
                {(Object.keys(SCENARIO_LABELS) as ScenarioType[]).map((scenario) => (
                  <button
                    key={scenario}
                    onClick={() => updateScenario(module, scenario)}
                    className={`rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 ${
                      scenarios[module] === scenario
                        ? "bg-sky-500 text-white shadow-sm"
                        : "bg-surface-elevated text-text-muted hover:text-text-primary hover:bg-white/5"
                    }`}
                  >
                    {SCENARIO_LABELS[scenario]}
                  </button>
                ))}
              </div>

              <button
                onClick={() => navigateToModule(module)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-surface-border bg-surface-elevated px-3 py-2 text-xs font-medium text-text-secondary hover:text-text-primary transition-colors"
              >
                <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                View {MODULE_LABELS[module]}
              </button>
            </section>
          ))}
        </div>

        {/* Preset quick actions */}
        <div className="card">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Scenario presets</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={() => setAllScenarios("success")}
              className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-2.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/15 transition-colors"
            >
              All Success
            </button>
            <button
              onClick={() => setAllScenarios("empty")}
              className="rounded-lg border border-amber-500/20 bg-amber-500/8 px-4 py-2.5 text-xs font-medium text-amber-400 hover:bg-amber-500/15 transition-colors"
            >
              All Empty
            </button>
            <button
              onClick={() => setAllScenarios("loading")}
              className="rounded-lg border border-sky-500/20 bg-sky-500/8 px-4 py-2.5 text-xs font-medium text-sky-400 hover:bg-sky-500/15 transition-colors"
            >
              All Loading
            </button>
            <button
              onClick={() => setAllScenarios("partial-failure")}
              className="rounded-lg border border-red-500/20 bg-red-500/8 px-4 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/15 transition-colors"
            >
              All Failure
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="rounded-xl border border-sky-500/10 bg-sky-500/5 px-5 py-4">
          <div className="flex items-start gap-3">
            <FlaskConical className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-xs text-text-secondary space-y-1">
              <p>Select scenarios per module to simulate different UI states. Changes persist in local storage. This sandbox is only available in development mode unless explicitly enabled via <code className="rounded bg-surface-elevated px-1 py-0.5 font-mono text-xs text-sky-400">NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
