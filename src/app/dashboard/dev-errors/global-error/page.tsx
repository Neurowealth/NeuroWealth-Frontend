export default function DashboardGlobalErrorTriggerPage() {
  // Unreachable in practice: GlobalErrorDevTrigger (rendered above the
  // ErrorBoundary by ClientProviders) throws as soon as this pathname is
  // active, before this page component ever renders. Kept so the route
  // resolves to a real page instead of a 404 if that mechanism is ever
  // removed.
  return null;
}
