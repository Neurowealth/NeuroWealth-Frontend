"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { logger } from "@/lib/logger";

export type ScenarioType = "success" | "empty" | "loading" | "partial-failure" | "timeout";
export type ModuleType = "portfolio" | "history" | "transactions" | "notifications";

interface ScenarioState {
  [key: string]: ScenarioType;
}

interface SandboxContextType {
  scenarios: ScenarioState;
  updateScenario: (module: ModuleType, scenario: ScenarioType) => void;
  getCurrentScenario: (module: ModuleType) => ScenarioType;
  resetAllScenarios: () => void;
  isSandboxMode: boolean;
}

const defaultScenarios: ScenarioState = {
  portfolio: "success",
  history: "success",
  transactions: "success",
  notifications: "success",
};
const SANDBOX_STORAGE_KEY = STORAGE_KEYS.SANDBOX_SCENARIOS;

const SandboxContext = createContext<SandboxContextType | undefined>(undefined);

export function useSandbox() {
  const context = useContext(SandboxContext);
  if (context === undefined) {
    throw new Error("useSandbox must be used within a SandboxProvider");
  }
  return context;
}

interface SandboxProviderProps {
  children: ReactNode;
}

export function SandboxProvider({ children }: SandboxProviderProps) {
  const [scenarios, setScenarios] = useState<ScenarioState>(defaultScenarios);
  const [isClient, setIsClient] = useState(false);
  const isSandboxMode =
    process.env.NODE_ENV === "development" ||
    process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_SANDBOX === "true";

  useEffect(() => {
    setIsClient(true);
    if (isSandboxMode) {
      // Load saved scenarios from localStorage
      const saved = localStorage.getItem(SANDBOX_STORAGE_KEY);
      if (saved) {
        try {
          setScenarios(JSON.parse(saved));
        } catch (e) {
          logger.error("Failed to load sandbox scenarios", e);
        }
      }
    }
  }, [isSandboxMode]);

  useEffect(() => {
    // Save scenarios to localStorage
    if (isClient && isSandboxMode) {
      localStorage.setItem(SANDBOX_STORAGE_KEY, JSON.stringify(scenarios));
    }
  }, [scenarios, isClient, isSandboxMode]);

  const updateScenario = useCallback((module: ModuleType, scenario: ScenarioType) => {
    if (isSandboxMode) {
      setScenarios((prev) => ({ ...prev, [module]: scenario }));
    }
  }, [isSandboxMode]);

  const getCurrentScenario = useCallback((module: ModuleType): ScenarioType => {
    return scenarios[module] || "success";
  }, [scenarios]);

  const resetAllScenarios = useCallback(() => {
    if (isSandboxMode) {
      setScenarios(defaultScenarios);
    }
  }, [isSandboxMode]);

  const value = useMemo<SandboxContextType>(
    () => ({
      scenarios,
      updateScenario,
      getCurrentScenario,
      resetAllScenarios,
      isSandboxMode,
    }),
    [scenarios, updateScenario, getCurrentScenario, resetAllScenarios, isSandboxMode]
  );

  return (
    <SandboxContext.Provider value={value}>
      {children}
    </SandboxContext.Provider>
  );
}
