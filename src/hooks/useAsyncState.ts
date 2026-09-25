"use client";

import { useCallback, useReducer, useRef } from "react";
import { ServiceError, type ServiceErrorCode } from "@/lib/mock-services";

// ─── State shape ──────────────────────────────────────────────────────────────

export type AsyncStatus = "idle" | "loading" | "success" | "error";

/** Predictable error shape exposed to consumers — mirrors ServiceError fields. */
export interface AsyncError {
  message: string;
  code: ServiceErrorCode;
  retryable: boolean;
}

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: AsyncError | null;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

type Action<T> =
  | { type: "LOADING" }
  | { type: "SUCCESS"; payload: T }
  | { type: "ERROR"; error: AsyncError }
  | { type: "RESET" };

function reducer<T>(state: AsyncState<T>, action: Action<T>): AsyncState<T> {
  switch (action.type) {
    case "LOADING":
      return { ...state, status: "loading", error: null };
    case "SUCCESS":
      return { status: "success", data: action.payload, error: null };
    case "ERROR":
      return { ...state, status: "error", error: action.error };
    case "RESET":
      return { status: "idle", data: null, error: null };
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
 * if (state.status === "error")   return <ErrorBlock title="…" description={state.error!.message} onAction={() => run(…)} />;
 * ```
 */
export function useAsyncState<T>() {
  const [state, dispatch] = useReducer(reducer<T>, {
    status: "idle",
    data: null,
    error: null,
  });
  const requestIdRef = useRef(0);

  const run = useCallback(async (fn: () => Promise<T>) => {
    const requestId = ++requestIdRef.current;
    dispatch({ type: "LOADING" });
    try {
      const result = await fn();
      if (requestId !== requestIdRef.current) return;
      dispatch({ type: "SUCCESS", payload: result });
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      const error: AsyncError =
        err instanceof ServiceError
          ? { message: err.message, code: err.code, retryable: err.retryable }
          : {
              message: err instanceof Error ? err.message : "An unexpected error occurred.",
              code: "UNKNOWN",
              retryable: true,
            };
      dispatch({ type: "ERROR", error });
    }
  }, []);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    dispatch({ type: "RESET" });
  }, []);

  return { state, run, reset };
}
