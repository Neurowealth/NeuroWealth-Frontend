import Link from "next/link";

export default function DashboardDevErrorsPage() {
  return (
    <main className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold text-text-primary">
          Error page dev triggers
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          Dev-only routes for verifying every error page and recovery action. Hidden in production.
        </p>
      </header>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Named error pages (401 / 403 / 404 / 500)
        </h2>
        <ul className="list-disc pl-5 text-sm text-text-primary space-y-2">
          <li>
            <Link className="text-primary hover:underline" href="/unauthorized">
              401 — Unauthorized (authentication required)
            </Link>
          </li>
          <li>
            <Link className="text-primary hover:underline" href="/forbidden">
              403 — Forbidden (access denied)
            </Link>
          </li>
          <li>
            <Link className="text-primary hover:underline" href="/dev-errors/nonexistent-route-trigger">
              404 — Not found (navigate to a missing route)
            </Link>
          </li>
          <li>
            <Link className="text-primary hover:underline" href="/server-error">
              500 — Server error (static error page)
            </Link>
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-secondary">
          Error boundary triggers
        </h2>
        <ul className="list-disc pl-5 text-sm text-text-primary space-y-2">
          <li>
            <Link className="text-primary hover:underline" href="/dashboard/dev-errors/route-error">
              Trigger route-level error (dashboard error boundary)
            </Link>
          </li>
          <li>
            <Link className="text-primary hover:underline" href="/dashboard/dev-errors/boundary-error">
              Trigger client ErrorBoundary fallback
            </Link>
          </li>
        </ul>
      </section>
    </main>
  );
}
