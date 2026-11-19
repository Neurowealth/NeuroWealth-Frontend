// Prevents static prerendering at build time — NEXT_PUBLIC_E2E_TESTING is
// inlined at build time too, so without this, GlobalErrorDevTrigger throws
// during `next build`'s static generation pass for this route, not just at
// request time. Matches route-error/page.tsx's own guard.
export const dynamic = "force-dynamic";

export default function DashboardGlobalErrorTriggerPage() {
  // Unreachable in practice: GlobalErrorDevTrigger (rendered above the
  // ErrorBoundary by ClientProviders) throws as soon as this pathname is
  // active, before this page component ever renders. Kept so the route
  // resolves to a real page instead of a 404 if that mechanism is ever
  // removed.
  return null;
}
