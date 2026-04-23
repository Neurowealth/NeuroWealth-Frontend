"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

type ScenarioType = "success" | "empty" | "loading" | "partial-failure" | "timeout";
type ModuleType = "portfolio" | "history" | "transactions";

interface ScenarioState {
  [key: string]: ScenarioType;
}

const DEV_MODE = process.env.NODE_ENV === "development";

const SCENARIO_LABELS: Record<ScenarioType, string> = {
  success: "Success",
  empty: "Empty State",
  loading: "Loading",
  "partial-failure": "Partial Failure",
  timeout: "Timeout",
};

const MODULE_LABELS: Record<ModuleType, string> = {
  portfolio: "Portfolio",
  history: "History",
  transactions: "Transactions",
};

export default function SandboxPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioState>({
    portfolio: "success",
    history: "success",
    transactions: "success",
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load saved scenarios from localStorage
    const saved = localStorage.getItem("sandbox-scenarios");
    if (saved) {
      try {
        setScenarios(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load sandbox scenarios:", e);
      }
    }
  }, []);

  useEffect(() => {
    // Save scenarios to localStorage
    if (isClient) {
      localStorage.setItem("sandbox-scenarios", JSON.stringify(scenarios));
    }
  }, [scenarios, isClient]);

  if (!DEV_MODE) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Development Only
            </h1>
            <p className="text-gray-600">
              This sandbox is only available in development mode.
            </p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const updateScenario = (module: ModuleType, scenario: ScenarioType) => {
    setScenarios((prev) => ({ ...prev, [module]: scenario }));
  };

  const resetAll = () => {
    const defaultScenarios: ScenarioState = {
      portfolio: "success",
      history: "success",
      transactions: "success",
    };
    setScenarios(defaultScenarios);
  };

  const navigateToModule = (module: ModuleType) => {
    const params = new URLSearchParams();
    params.set("scenario", scenarios[module]);
    router.push(`/dashboard/${module}?${params.toString()}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Development Sandbox
                </h1>
                <p className="text-gray-600 mt-2">
                  Toggle mock scenarios for testing different UI states
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Dev Mode Active
                </span>
                <button
                  onClick={resetAll}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Reset All
                </button>
              </div>
            </div>
          </div>

          {/* Scenario Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {(Object.keys(MODULE_LABELS) as ModuleType[]).map((module) => (
              <div key={module} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {MODULE_LABELS[module]}
                  </h2>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                    {SCENARIO_LABELS[scenarios[module] as ScenarioType]}
                  </span>
                </div>

                <div className="space-y-2">
                  {(Object.keys(SCENARIO_LABELS) as ScenarioType[]).map(
                    (scenario) => (
                      <button
                        key={scenario}
                        onClick={() => updateScenario(module, scenario)}
                        className={`w-full text-left px-4 py-2 rounded-lg border transition-colors ${
                          scenarios[module] === scenario
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        }`}
                      >
                        {SCENARIO_LABELS[scenario]}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => navigateToModule(module)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View {MODULE_LABELS[module]}
                </button>
              </div>
            ))}
          </div>

          {/* Global Actions */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => {
                  setScenarios({
                    portfolio: "success",
                    history: "success",
                    transactions: "success",
                  });
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                All Success
              </button>
              <button
                onClick={() => {
                  setScenarios({
                    portfolio: "empty",
                    history: "empty",
                    transactions: "empty",
                  });
                }}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                All Empty
              </button>
              <button
                onClick={() => {
                  setScenarios({
                    portfolio: "loading",
                    history: "loading",
                    transactions: "loading",
                  });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                All Loading
              </button>
              <button
                onClick={() => {
                  setScenarios({
                    portfolio: "partial-failure",
                    history: "partial-failure",
                    transactions: "partial-failure",
                  });
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                All Failure
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              How to use this sandbox
            </h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Select scenarios for each module independently</li>
              <li>Click &quot;View Module&quot; to see the scenario in action</li>
              <li>Scenarios are saved locally and persist across page refreshes</li>
              <li>Use quick actions to set all modules to the same scenario</li>
              <li>This sandbox is only available in development mode</li>
            </ul>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
