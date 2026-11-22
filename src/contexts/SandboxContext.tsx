"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { logger } from "@/lib/logger";

export type ScenarioType = "success" | "empty" | "loading" | "partial-failure" | "timeout";
export type ModuleType = "portfolio" | "history" | "transactions" | "notifications";

export interface ScenarioState {
  [key: string]: ScenarioType;
}

interface SandboxContextType {
  scenarios: ScenarioState;
  updateScenario: (module: ModuleType, scenario: ScenarioType) => void;
  getCurrentScenario: (module: ModuleType) => ScenarioType;
  resetAllScenarios: () => void;
  isSandboxMode: boolean;
}

export const defaultScenarios: ScenarioState = {
  portfolio: "success",
  history: "success",
  transactions: "success",
  notifications: "success",
};

const VALID_SCENARIO_TYPES: ReadonlySet<string> = new Set<ScenarioType>([
  "success",
  "empty",
  "loading",
  "partial-failure",
  "timeout",
]);

export function validateScenarioState(parsed: unknown): ScenarioState {
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    return { ...defaultScenarios };
  }

  const result: ScenarioState = { ...defaultScenarios };
  const candidate = parsed as Record<string, unknown>;

  for (const key of Object.keys(defaultScenarios)) {
    const value = candidate[key];
    if (typeof value === "string" && VALID_SCENARIO_TYPES.has(value)) {
      result[key] = value as ScenarioType;
    }
  }

  return result;
}

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
          const parsed: unknown = JSON.parse(saved);
          setScenarios(validateScenarioState(parsed));
        } catch (e) {
          logger.error("Failed to load sandbox scenarios", e);
          setScenarios(defaultScenarios);
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
