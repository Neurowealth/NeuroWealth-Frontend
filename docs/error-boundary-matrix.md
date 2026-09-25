# Error boundary matrix

Covers every error-catching layer in the app: which route segments can throw, which
boundary catches the error, what the user sees, and how they recover.

## Boundary inventory

| Boundary | File | Type | Scope |
| --- | --- | --- | --- |
| Global React `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | React class component | Entire app (wraps `<ClientProviders>` in `src/app/layout.tsx`) |
| Root Next.js error page | `src/app/error.tsx` | Next.js `error.tsx` | All server-side errors at the root segment |
| Dashboard error page | `src/app/dashboard/error.tsx` | Next.js `error.tsx` | All server-side throws inside `src/app/dashboard/**` |
| Onboarding error page | `src/app/onboarding/error.tsx` | Next.js `error.tsx` | Server-side throws inside `/onboarding` |
| Profile error page | `src/app/profile/error.tsx` | Next.js `error.tsx` | Server-side throws inside `/profile` |

## Segment throw matrix

| Route segment | Throws? | Cause | Caught by | User-visible copy | Recovery action |
| --- | --- | --- | --- | --- | --- |
| `/dashboard/dev-errors/route-error` (dev only) | Yes — intentional | `throw new Error(…)` in the page component | `src/app/dashboard/error.tsx` | Title: "Dashboard unavailable"; Description: "We are having trouble loading this dashboard view right now. Your funds and wallet connection remain safe." | Primary: "Back to dashboard home" (`href=/dashboard`); Secondary: "Try again" (calls `reset()`) |
| `/dashboard/dev-errors/boundary-error` (dev only) | Yes — on button click | `TriggerBoundaryError` sets `shouldThrow = true`, causing a render throw | Global `ErrorBoundary` in `src/app/layout.tsx` | Heading: "We hit a temporary app issue."; Body: "Try reloading this view. If the issue keeps happening, return shortly while we investigate." | "Try again" button resets `hasError` state; full reload also recovers |
| `/dashboard/**` (all live dashboard segments) | Possible (data fetch, runtime) | Unhandled exception in a server component or async route handler | `src/app/dashboard/error.tsx` | Title: "Dashboard unavailable"; Description: "We are having trouble loading this dashboard view right now. Your funds and wallet connection remain safe." | Primary: "Back to dashboard home"; Secondary: "Try again" |
| `/onboarding` | Possible | Unhandled exception in onboarding server components | `src/app/onboarding/error.tsx` | Title: "Onboarding unavailable"; Description: "We could not load the onboarding flow. Your current progress remains safe, and you can retry the route when ready." | Primary: "Back to home" (`href=/`); Secondary: "Try again" |
| `/profile` | Possible | Unhandled exception in profile server components | `src/app/profile/error.tsx` | Title: "Profile unavailable"; Description: "We could not load your profile view. Your saved preferences remain unchanged, and you can try loading this route again." | Primary: "Back to dashboard" (`href=/dashboard`); Secondary: "Try again" |
| All other routes (global fallback) | Possible | Unhandled runtime exception outside a named error segment | `src/app/error.tsx` | Title: "We ran into an unexpected issue"; Description: "The page could not finish loading. Your account and funds remain safe. Try again now or return home." | Primary: "Back to home" (`href=/`); Secondary: "Try again" |
| Client component crash (any route) | Possible | Unhandled render throw in a `"use client"` component | Global `ErrorBoundary` (`src/app/layout.tsx`) | Heading: "We hit a temporary app issue."; Body: "Try reloading this view. If the issue keeps happening, return shortly while we investigate." | "Try again" button resets the React error boundary state |

## Copy tone check

All error pages use `src/components/ui/ErrorPage` and follow the same tone pattern:

1. **Title** (what broke, short, no blame): "Dashboard unavailable", "We ran into an unexpected issue"
2. **Description** (context + safety reassurance): "We are having trouble loading this dashboard view right now. Your funds and wallet connection remain safe."
3. **Recovery actions** (primary navigation and/or try-again): e.g. "Back to dashboard home" (primary) + "Try again" (secondary)

The global `ErrorBoundary` (`src/components/ErrorBoundary.tsx`) renders its own inline
fallback rather than using `ErrorPage`, but follows the same heading + body pattern.

No error page exposes stack traces, error codes, or internal server details to users.
The raw `error` prop is accepted but intentionally unused (`error: _error`) in every
`error.tsx` to prevent accidental leaks.

## Test coverage

Playwright smoke tests live in `e2e/error-boundary-smoke.spec.ts` and cover both
boundary types:

- **Route-level boundary**: navigates to `/dashboard/dev-errors/route-error` and asserts
  the dashboard error page heading and safety-reassurance copy are visible.
- **Client-side `ErrorBoundary`**: navigates to `/dashboard/dev-errors/boundary-error`,
  clicks the trigger button, and asserts the global fallback heading and reload-prompt copy
  are visible.

Both dev-only trigger routes return 404 in production (`notFound()` guard), so they are
safe to leave in the codebase.

## Adding a new segment

1. Create `src/app/<route>/error.tsx` exporting a default `"use client"` component that
   accepts `{ error, reset }`.
2. Use `<ErrorPage>` from `src/components/ui/ErrorPage` for consistent copy and layout.
3. Follow the tone pattern above (what broke → safety reassurance → recovery).
4. Add a row to this matrix.
5. Add a Playwright smoke in `e2e/error-boundary-smoke.spec.ts` using the dev-only trigger
   pattern if possible, or document manual QA steps in the PR description.
