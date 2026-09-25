import { notFound } from "next/navigation";
import type { ReactNode } from "react";

const DEV_ERRORS_ENABLED = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_E2E_TESTING === "true";

export default function DevErrorsLayout({ children }: { children: ReactNode }) {
  if (!DEV_ERRORS_ENABLED) {
    notFound();
  }

  return (
    <div className="rounded-lg border border-dashed border-yellow-500/40 bg-yellow-500/5 p-4">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-yellow-400">
        Internal — dev-only route
      </p>
      {children}
    </div>
  );
}
