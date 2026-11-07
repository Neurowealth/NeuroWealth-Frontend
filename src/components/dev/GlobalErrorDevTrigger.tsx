"use client";

import { usePathname } from "next/navigation";

const ENABLED = process.env.NEXT_PUBLIC_E2E_TESTING === "true";
const TRIGGER_PATH = "/dashboard/dev-errors/global-error";

/**
 * Dev/E2E-only. Rendered by ClientProviders as a sibling of the global
 * ErrorBoundary (not inside it), so a throw here escapes past every
 * error.tsx and the ErrorBoundary and is only catchable by
 * src/app/global-error.tsx — the only way to exercise that boundary, since
 * it exists specifically for crashes above RootLayout/ClientProviders.
 * Gated on NEXT_PUBLIC_E2E_TESTING so this can never fire in production.
 */
export function GlobalErrorDevTrigger() {
  const pathname = usePathname();

  if (ENABLED && pathname === TRIGGER_PATH) {
    throw new Error("Intentional ClientProviders crash for global-error.tsx testing");
  }

  return null;
}
