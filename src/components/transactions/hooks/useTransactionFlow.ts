/**
 * useTransactionFlow.ts
 *
 * Orchestrates the deposit/withdrawal state machine that TransactionFlow.tsx
 * previously ran inline: theme/kind/preview <-> route sync, sandbox-scenario
 * simulation, and the quote -> confirm -> submit -> pending -> receipt
 * transitions (including error-recovery retries). Composes
 * useTransactionForm and useTransactionAPI, which already own form state and
 * the raw quote/submit API calls respectively — this hook owns the stage
 * machine that ties them together.
 *
 * Router/search-params/sandbox state are passed in rather than read from
 * next/navigation or SandboxContext directly, so the hook can be unit-tested
 * with plain objects instead of a Next.js router or React context provider.
 */

import { startTransition, useEffect, useRef, useState } from "react";
import {
  buildPreviewSnapshot,
  buildTransactionReceipt,
  getTransactionContext,
  parsePreviewState,
  parseTransactionKind,
  PendingTransaction,
  TransactionKind,
  TransactionPreviewState,
  TransactionQuote,
  TransactionReceipt,
  type RecoveryAction,
} from "@/lib/transactions";
import type { ScenarioType } from "@/contexts/SandboxContext";
import { getTheme } from "../utils/transaction-utils";
import { useTransactionForm } from "./useTransactionForm";
import { useTransactionAPI } from "./useTransactionAPI";

type ThemeMode = "light" | "dark";
type Stage = "form" | "confirm" | "pending" | "success" | "failure" | "error";

export interface RouteSearchParams {
  get(key: string): string | null;
  toString(): string;
}

export interface FlowRouter {
  replace(href: string, options?: { scroll?: boolean }): void;
}

export interface UseTransactionFlowArgs {
  searchParams: RouteSearchParams;
  router: FlowRouter;
  isSandboxMode: boolean;
  scenario: ScenarioType;
  tDomain: any;
}

export function useTransactionFlow({
  searchParams,
  router,
  isSandboxMode,
  scenario,
  tDomain,
}: UseTransactionFlowArgs) {
  const timeoutRef = useRef<number | null>(null);

  const [theme, setTheme] = useState<ThemeMode>(() => getTheme(searchParams));
  const [kind, setKind] = useState<TransactionKind>(() =>
    parseTransactionKind(searchParams.get("kind")),
  );
  const [preview, setPreview] = useState<TransactionPreviewState>(() =>
    parsePreviewState(searchParams.get("preview")),
  );
  const [stage, setStage] = useState<Stage>("form");
  const [quote, setQuote] = useState<TransactionQuote | null>(null);
  const [pending, setPending] = useState<PendingTransaction | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [requestMessage, setRequestMessage] = useState<string | null>(null);
  const [lastFailedAction, setLastFailedAction] = useState<
    "review" | "confirm" | null
  >(null);

  const {
    formValues,
    fieldErrors,
    updateField,
    validate,
    reset: resetForm,
    setErrors,
    setValues,
  } = useTransactionForm(kind, tDomain);

  const {
    isSubmitting,
    recovery,
    lastErrorReference,
    requestQuote,
    submitTransaction,
    clearRecovery,
    setSubmitting,
    cancelRequest,
    reset: resetApi,
  } = useTransactionAPI();

  const context = getTransactionContext(kind, tDomain.context);

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    cancelRequest();

    if (preview === "interactive") {
      setStage("form");
      resetForm();
      setQuote(null);
      setPending(null);
      setReceipt(null);
      setRequestMessage(null);
      resetApi();
      setLastFailedAction(null);
      return;
    }

    const snapshot = buildPreviewSnapshot(kind, preview, tDomain);

    setStage(snapshot.stage);
    setValues(snapshot.form);
    setErrors(snapshot.fieldErrors);
    setQuote(snapshot.quote);
    setPending(snapshot.pending);
    setReceipt(snapshot.receipt);
    setRequestMessage(null);
    resetApi();
    setLastFailedAction(null);
  }, [kind, preview, cancelRequest, resetForm, resetApi, setValues, setErrors]);

  // Handle sandbox scenarios
  useEffect(() => {
    if (isSandboxMode && scenario !== "success") {
      if (scenario === "loading") {
        setSubmitting(true);
        setRequestMessage("Loading transaction data...");
        const timer = setTimeout(() => {
          setSubmitting(false);
          setRequestMessage(null);
        }, 3000);
        return () => clearTimeout(timer);
      } else if (scenario === "timeout") {
        setSubmitting(true);
        setRequestMessage("Request timed out. Please try again.");
        const timer = setTimeout(() => {
          setSubmitting(false);
          setRequestMessage(
            "Connection timeout. Please check your network and retry.",
          );
        }, 5000);
        return () => clearTimeout(timer);
      } else if (scenario === "partial-failure") {
        setRequestMessage(
          "Partial service degradation. Some features may be unavailable.",
        );
        setStage("form");
      } else if (scenario === "empty") {
        setStage("form");
        resetForm();
        setQuote(null);
        setPending(null);
        setReceipt(null);
        setRequestMessage("No transaction data available.");
      }
    }
  }, [scenario, isSandboxMode, kind, setSubmitting, resetForm]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      // Abort any in-flight request on unmount to prevent state updates on an
      // unmounted component and to avoid leaking the pending completion timer.
      cancelRequest();
    };
  }, [cancelRequest]);

  function syncRoute(
    nextTheme: ThemeMode,
    nextKind: TransactionKind,
    nextPreview: TransactionPreviewState,
  ) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("theme", nextTheme);
    params.set("kind", nextKind);

    if (nextPreview === "interactive") {
      params.delete("preview");
    } else {
      params.set("preview", nextPreview);
    }

    startTransition(() => {
      router.replace(`/dashboard/transactions?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  function handleThemeChange(nextTheme: ThemeMode) {
    setTheme(nextTheme);
    syncRoute(nextTheme, kind, preview);
  }

  function handleKindChange(nextKind: TransactionKind) {
    setKind(nextKind);
    syncRoute(theme, nextKind, preview);
  }

  function handlePreviewChange(nextPreview: TransactionPreviewState) {
    setPreview(nextPreview);
    syncRoute(theme, kind, nextPreview);
  }

  function handleMaxAmount() {
    updateField("amount", context.availableAmount.toFixed(2));
  }

  async function submitReview() {
    if (preview !== "interactive") {
      return;
    }

    if (!validate()) {
      return;
    }

    setRequestMessage(null);
    clearRecovery();
    setLastFailedAction(null);

    const result = await requestQuote(kind, formValues, quote?.reference);

    if (result.status === "aborted") {
      return;
    }

    if (result.status === "success") {
      setErrors({});
      setQuote(result.quote);
      setStage("confirm");
      setLastFailedAction(null);
      return;
    }

    setLastFailedAction("review");
    setErrors(result.fieldErrors);
    setStage("error");
  }

  async function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitReview();
  }

  async function handleConfirm() {
    if (preview !== "interactive") {
      return;
    }

    setRequestMessage(null);
    clearRecovery();
    setLastFailedAction(null);

    const result = await submitTransaction(kind, formValues, quote?.reference);

    if (result.status === "aborted") {
      return;
    }

    if (result.status === "success") {
      setPending(result.pending);
      setQuote(result.pending.quote);
      setStage("pending");
      setLastFailedAction(null);

      timeoutRef.current = window.setTimeout(() => {
        const nextReceipt = buildTransactionReceipt(
          result.pending,
          result.pending.nextStatus === "failure" ? "failure" : "success",
          tDomain.receipt
        );

        setReceipt(nextReceipt);
        setStage(nextReceipt.status);
        setSubmitting(false);
      }, result.pending.completionDelayMs);
      return;
    }

    setLastFailedAction("confirm");
    setErrors(result.fieldErrors);
    setStage("error");
  }

  function resetFlow() {
    handlePreviewChange("interactive");
  }

  /**
   * Handles recovery actions from the error recovery UI.
   * Maps user choices to product actions: retry (submitAgain), edit (backToForm), or support (open email).
   */
  function handleRecoveryAction(action: RecoveryAction) {
    switch (action) {
      case "retry": {
        // Clear error state and retry the failed operation with the saved values.
        clearRecovery();
        setRequestMessage("Retrying request...");
        if (lastFailedAction === "confirm" && quote) {
          void handleConfirm();
        } else {
          void submitReview();
        }
        break;
      }
      case "edit": {
        // Return to form so user can review and edit amount or wallet details
        setStage("form");
        clearRecovery();
        setSubmitting(false);
        setLastFailedAction(null);
        break;
      }
      case "support": {
        // Open email client to contact support with transaction reference
        const email = recovery?.supportEmail || "support@neurowealth.com";
        const subject = encodeURIComponent(
          `Transaction issue - Reference: ${lastErrorReference || "unknown"}`,
        );
        const body = encodeURIComponent(
          `Describe your issue here.\n\nTransaction Reference: ${lastErrorReference || "N/A"}\nTransaction Type: ${kind}\n`,
        );
        window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
        break;
      }
    }
  }

  return {
    theme,
    kind,
    preview,
    stage,
    quote,
    pending,
    receipt,
    requestMessage,
    context,
    formValues,
    fieldErrors,
    isSubmitting,
    recovery,
    updateField,
    handleThemeChange,
    handleKindChange,
    handlePreviewChange,
    handleMaxAmount,
    submitReview,
    handleReview,
    handleConfirm,
    handleRecoveryAction,
    resetFlow,
    setStage,
  };
}
