"use client";

import { useCallback, useReducer } from "react";
import { ServiceError } from "@/lib/mock-services";

// ─── State shape ──────────────────────────────────────────────────────────────

export type AsyncStatus = "idle" | "loading" | "success" | "error";

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: string | null;
  /** True when the error is retryable (from ServiceError.retryable) */
  retryable: boolean;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; message: string; retryable: boolean }
  | { type: "RESET" };

function reducer<T>(state: AsyncState<T>, action: Action<T>): AsyncState<T> {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: null };
    case "SUCCESS":
      return { status: "success", data: action.payload, error: null, retryable: false };
    case "ERROR":
      return { ...state, status: "error", error: action.message, retryable: action.retryable };
    case "RESET":
      return { status: "idle", data: null, error: null, retryable: false };
    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages loading / success / error state for any async operation.
 *
 * Usage:
 * ```tsx
 * const { state, run, reset } = useAsyncState<PortfolioPayload>();
 *
 * useEffect(() => {
 *   run(() => mockPortfolioService.fetchPortfolio());
 * }, [run]);
 *
 * if (state.status === "loading") return <DashboardSkeleton />;
 * if (state.status === "error")   return <ErrorBlock title="…" description={state.error!} onAction={() => run(…)} />;
 * ```
 */
export function useAsyncState<T>() {
  const [state, dispatch] = useReducer(reducer<T>, {
    status: "idle",
    data: null,
    error: null,
    retryable: false,
  });

  const run = useCallback(async (fn: () => Promise<T>) => {
    dispatch({ type: "LOADING" });
    try {
      const result = await fn();
      dispatch({ type: "SUCCESS", payload: result });
    } catch (err) {
      const message =
        err instanceof ServiceError
          ? err.message
          : err instanceof Error
            ? err.message
            : "An unexpected error occurred.";
      const retryable = err instanceof ServiceError ? err.retryable : true;
      dispatch({ type: "ERROR", message, retryable });
    }
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, run, reset };
}
