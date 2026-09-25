"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";
import { logger } from "@/lib/logger";
import "./globals.css";

/**
 * Next.js root error boundary: catches render-time throws above RootLayout
 * (e.g. inside ClientProviders' context providers) that error.tsx cannot
 * reach. Replaces <html>/<body> entirely when active, so it must render its
 * own document shell instead of relying on layout.tsx.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error("Root provider crash", { digest: error.digest });
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="antialiased font-sans bg-dark-900 text-slate-200">
        <ErrorPage
          statusCode={500}
          title="We ran into an unexpected issue"
          description="The page could not finish loading. Your account and funds remain safe. Try again now or return home."
          icon={<AlertTriangle size={32} />}
          primaryAction={{ label: "Back to home", href: "/" }}
          secondaryAction={{ label: "Try again", onClick: reset }}
        />
      </body>
    </html>
  );
}
