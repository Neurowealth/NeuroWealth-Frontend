/**
 * transaction-style-utils.ts
 *
 * CSS-module-coupled class helpers for the transaction flow.
 * Kept separate from the pure helpers in transaction-utils.ts so those
 * remain unit-testable under the Node test runner (which cannot load .css).
 */

import rawStyles from "../transaction-flow.module.css";

const styles: Record<string, string> = rawStyles || new Proxy({}, {
  get: (target, prop) => typeof prop === 'string' ? prop + '_mock' : undefined
});

export function getToneClassName(
  tone: "error" | "success" | "warning",
): string {
  if (tone === "error") {
    return styles.statusError;
  }

  if (tone === "warning") {
    return styles.statusWarning;
  }

  return styles.statusSuccess;
}

export function getInputStateClassName(
  value: string,
  error?: string,
  isValidated?: boolean,
): string {
  if (error) {
    return styles.inputError;
  }

  if (isValidated && value) {
    return styles.inputSuccess;
  }

  return "";
}
