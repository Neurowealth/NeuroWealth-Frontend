/**
 * transaction-utils.ts
 *
 * Pure utility functions for the transaction flow.
 * Extracted from TransactionFlow for reusability and unit testing.
 * CSS-coupled class helpers live in transaction-style-utils.ts.
 */

import { TransactionFieldErrors } from "@/lib/transactions";

export function getTheme(
  searchParams: Pick<URLSearchParams, "get">,
): "light" | "dark" {
  return searchParams.get("theme") === "dark" ? "dark" : "light";
}

export function sanitizeAmount(value: string): string {
  return value.replace(/[^\d.]/g, "");
}

export function detailsToFieldErrors(
  details?: Record<string, string | string[]>,
): TransactionFieldErrors {
  if (!details) {
    return {};
  }

  const readValue = (key: string): string | undefined => {
    const value = details[key];

    if (Array.isArray(value)) {
      return value[0];
    }

    return typeof value === "string" ? value : undefined;
  };

  return {
    amount: readValue("amount") ?? readValue("values.amount"),
    walletAddress:
      readValue("walletAddress") ?? readValue("values.walletAddress"),
    walletConnected:
      readValue("walletConnected") ?? readValue("values.walletConnected"),
    form: readValue("form") ?? readValue("body"),
  };
}

export function currentStepIndex(
  stage: "form" | "confirm" | "pending" | "success" | "failure" | "error",
): number {
  if (stage === "form" || stage === "error") {
    return 0;
  }

  if (stage === "confirm") {
    return 1;
  }

  return 2;
}
