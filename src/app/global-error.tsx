"use client";

import { AlertTriangle } from "lucide-react";
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function GlobalError({
  error: _error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100 antialiased">
        <ErrorPage
          statusCode={500}
          title="Application error"
          description="A critical error occurred while initializing the application layout or context providers. Your account and funds remain safe."
          icon={<AlertTriangle size={32} className="text-rose-400" />}
          primaryAction={{ label: "Back to home", href: "/" }}
          secondaryAction={{ label: "Try again", onClick: reset }}
        />
      </body>
    </html>
  );
}
