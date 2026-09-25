# Error Boundary Architecture & Matrix

This matrix documents the hierarchical error-handling boundaries across NeuroWealth Frontend, detailing the scope of crashes each boundary intercepts, the fallback UI presented, and recovery mechanisms.

## Boundary Inventory

| Boundary File | Scope & Catch Layer | Fallback Component | Recovery Mechanism |
|---|---|---|---|
| `src/app/global-error.tsx` | Catches render-time throws above `RootLayout` or inside `ClientProviders` context providers (e.g. auth context initialization, theme provider crashes). Replaces the entire root HTML document. | Custom full-page error layout with `ErrorPage` | "Try again" (calls `reset()`), or navigate to `/` |
| `src/app/error.tsx` | Catches root-level page and layout render errors within the standard app shell. | Full-page `ErrorPage` | "Try again" (calls `reset()`), or navigate to `/` |
| `src/app/dashboard/error.tsx` | Intercepts dashboard-specific page failures (e.g. data fetching or rendering exceptions in dashboard sub-views). | Dashboard unavailable error panel | "Reload dashboard" or navigate to `/dashboard` |
| Component `ErrorBoundary` | Client-side wrapper around isolated high-risk widgets (charts, strategy simulation tools, transaction modals). | Inline card fallback with error message | Local retry button without unmounting parent page |

## Error Catching Details

### 1. `global-error.tsx`
- **Why it is necessary:** Next.js `error.tsx` does not catch errors thrown inside the root `layout.tsx` or top-level providers wrapped in `ClientProviders`.
- **Catch Target:** Uncaught exceptions in client context initialization (Stellar wallet kit provider, theme persistence context, global error monitoring listeners).
- **Behavior:** Renders standalone `<html>` and `<body>` tags with high-contrast recovery actions.

### 2. `error.tsx`
- **Catch Target:** Route-level component render crashes across public and onboarding pages.
- **Behavior:** Keeps root layout metadata and branding intact while displaying safe recovery options.

### 3. E2E Verification
- Smoke tests located in `e2e/error-boundary-smoke.spec.ts` verify route-level errors, component-level boundary fallback activation, and global error provider-level handling.
