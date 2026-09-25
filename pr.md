## Summary

Fixes four issues: two in the command palette (z-index and focus trap) and two security fixes (CSRF check that fails closed, and a Next.js upgrade that patches the middleware auth bypass).

Closes #882, closes #881, closes #876, closes #875

## Changes

**#882 — CommandPaletteDialog uses the shared z-index scale**
- Replaced the hardcoded `z-[9999]` with `z-modal`. Tailwind v4 generates this class from `--z-index-modal` (1020) in `globals.css`, and `Modal.tsx` already uses it.
- Toasts (`--z-index-toast`, 1030) and the diagnostics panel (`--z-index-dev-tool`, 1040) now stack above the open palette, as the overlay scale intends.

**#881 — Focus trap in CommandPaletteDialog**
- Added `useFocusTrap(containerRef, true)` on the `role="dialog"` container, the same pattern as `Modal.tsx` and `Drawer.tsx`.
- The trap is always active because `CommandPalette` only mounts the dialog while it is open. On close, the trap's cleanup returns focus to the element that had it before the palette opened.

**#876 — `requireAuth` CSRF check fails closed**
- With `requireSameOrigin: true`, requests are now rejected unless `Origin` exactly matches the request origin. Before this change, a request with neither `Origin` nor `Sec-Fetch-Site` was treated as same-origin.
- Only `POST /api/transactions` and `PUT /api/strategy` opt in. Browsers always send `Origin` on POST/PUT, and the app calls these routes with same-origin `fetch`, so normal app traffic is unaffected.
- **Scope note:** I also updated `src/app/api/strategy/route.test.ts` and `src/app/api/transactions/route.test.ts`, which the issue didn't list. Their test requests had no `Origin` header, which no browser would send, so I added `Origin: http://localhost:3000`.

**#875 — Upgrade Next.js to patch CVE-2025-29927 (GHSA-f82v-jwr5-mffw)**
- `next` and `eslint-config-next` go from `14.2.3` to `14.2.35`, the latest 14.2.x.
- Updated `docs/security/npm-audit-policy.md`. Advisories for `next` drop from 35 (3 critical) to 23 (2 critical).
- **Still open:** 14.2.35 is the last 14.x release. GHSA-2xp9-vwfh-vxw4 (RCE in image optimization) and GHSA-p293-qw3h-jr36 (RCE on Windows-hosted servers) are only fixed in `>=15.5.24`. The doc keeps `next` as `must-fix` pending a 15.5.x upgrade.
- `yarn audit --json` timed out against the registry again, so I took the `next` numbers from npm's bulk advisory endpoint. The doc says this and notes that the counts for the rest of the dependency tree are from before the upgrade.

## Verification

**Automated tests**
- `src/lib/api-auth.test.ts`: new tests for four cases:
  - matching `Origin` is allowed
  - mismatched `Origin` gets 403
  - `Sec-Fetch-Site: cross-site` gets 403
  - missing `Origin` gets 403, with or without `Sec-Fetch-Site`
- `src/components/CommandPaletteDialog.test.ts`: new source tests asserting that `useFocusTrap` is attached to the dialog container, that `z-modal` is used, and that no hardcoded `z-[N]` class remains.
- Passing: `api-auth`, `CommandPaletteDialog`, `strategy/route`, `transactions/route` and `middleware` tests.

**Manual check of the bypass (`next dev`)**
- Requests to `/dashboard` with `x-middleware-subrequest` (`middleware`, `middleware:…` ×5, `src/middleware:…` ×5) now get **400**.

**Failures already on `main`, not caused by this PR**
- `yarn typecheck` reports the same 7 errors before and after this PR (`useNotificationPreferences.ts`, `useAsyncState.test.ts`, `notifications-race.test.ts`, `release-checklist/page.test.tsx`).
- `yarn build` compiles under 14.2.35, then stops at type-checking because `useNotificationPreferences.ts` is missing its `useEffect` import (one of the errors above).
- `StrategySelector.test.ts` hangs on `main` as well. It mocks `fetch` and doesn't touch the changed code.

## QA steps

1. Open the palette with Cmd/Ctrl+K. Press Tab and Shift+Tab repeatedly: focus should stay inside the palette. Press Escape: focus should return to the element that had it before.
2. With the palette open, trigger a toast. The toast should appear above the palette backdrop.
3. Change the strategy in the Strategy selector and submit a deposit quote. Both should succeed (no 403).
4. `curl -X PUT <host>/api/strategy -H 'Cookie: nw_session=<valid>' -H 'Content-Type: application/json' -d '{"strategy":"balanced"}'` with no `Origin` header should return **403**.

## Follow-up needed (out of scope)

`middleware.ts` is at the repo root, but this app uses `src/app`. Next.js only loads middleware from the same level as `app/`, which here means `src/middleware.ts`, so the middleware never runs. Under `next dev`, an unauthenticated `GET /dashboard` returns **200** instead of redirecting to `/login`. Moving the file (and fixing the `../middleware` import in `src/middleware.test.ts`) should be its own PR, since it changes routing behavior.
