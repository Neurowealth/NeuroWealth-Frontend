# Post-audit queue (2026-07)

60 contributor-ready issues from a fresh codebase audit (accessibility, testing/type-safety, performance, UX/responsive/theming, and API/security/docs), run against the current `main` branch. Every item was verified against actual file content — no duplicates of the already-open cleanup batch (#328-#350) or the Next.js upgrade (#128).

## Index

| # | Title | Labels |
| - | ----- | ------ |
| A1 | Add visible focus ring to Switch toggle component | `a11y`, `cleanup`, `good first issue` |
| A2 | Make TimePicker dropdown keyboard-operable | `a11y`, `bug` |
| A3 | Fix TimePicker Escape-to-close once the filter input has focus | `a11y`, `bug`, `good first issue` |
| A4 | Make DataTable rows actually keyboard-activatable as documented | `a11y`, `bug` |
| A5 | Restore a visible focus state on the Audit Trail filter select | `a11y`, `css`, `good first issue` |
| A6 | Fix Audit Trail's non-functional "Show details" toggle on desktop and add aria-expanded | `a11y`, `bug`, `dashboard` |
| A7 | Fix low-contrast text in Audit Trail dark theme | `a11y`, `css`, `good first issue` |
| A8 | Respect prefers-reduced-motion in Line/Bar/Area chart wrappers | `a11y`, `dashboard`, `good first issue` |
| A9 | Give chart SVGs an accessible name | `a11y`, `dashboard` |
| A10 | Wire aria-invalid/aria-describedby into deposit/withdraw form fields | `a11y`, `bug` |
| A11 | Expose selection state on the theme selector buttons | `a11y`, `good first issue` |
| A12 | Fix notification bell's unread count being invisible to screen readers | `a11y`, `bug` |
| B1 | Add tests for normalizePortfolioPayload's real-backend response path | `testing`, `api` |
| B2 | Add unit tests for src/lib/user.ts | `testing`, `good first issue` |
| ~~B3~~ | ~~Add unit tests for the service-layer adapters and remove `any` from their error types~~ | ~~`testing`, `typescript`, `api`~~ — **closed by #727** |
| B4 | Add tests for the i18n locale-state singleton and locale-aware formatters | `testing`, `good first issue` |
| B5 | Replace `t: any` with a typed message-namespace in dashboard components | `typescript`, `cleanup`, `good first issue` |
| B6 | Add tests for useRealtimeStream's cumulative state and stop/reset guarding | `testing`, `dashboard` |
| B7 | Resolve the two differently-shaped useDateFilter hooks | `cleanup`, `testing`, `good first issue` |
| B8 | Guard useNotifications' localStorage read against malformed JSON | `bug`, `testing`, `good first issue` |
| B9 | Assert on actual response data in transaction-history route tests | `testing`, `api` |
| B10 | Add direct unit tests for validation/api.ts's error-grouping helpers | `testing`, `good first issue` |
| B11 | Deduplicate transaction-utils logic hand-copied into TransactionFlow.tsx and add tests | `cleanup`, `testing`, `refactor` |
| B12 | Add tests for wallet/network mismatch detection | `testing`, `security` |
| B13 | Add tests for Pagination's page-window algorithm and remove its `any` cast | `testing`, `typescript`, `good first issue` |
| C1 | Lazy-load the Stellar SDK / wallet-kit chain instead of importing it in every page's bundle | `performance`, `cleanup` |
| C2 | Memoize PortfolioDashboard's chart data and add React.memo where render cost is high | `performance`, `dashboard` |
| C3 | Code-split the dev-only DiagnosticsPanel out of the production bundle | `performance`, `cleanup`, `good first issue` |
| C4 | Memoize AuditTrail's filter+sort computation | `performance`, `good first issue` |
| C5 | Remove unjustified force-dynamic from the public landing page | `performance`, `good first issue` |
| C6 | Lazy-load GlobalSearch instead of bundling it into every page via Navbar | `performance`, `cleanup` |
| C7 | Memoize SandboxContext's provider value | `performance`, `cleanup` |
| C8 | Memoize AuthContext's provider value | `performance`, `cleanup` |
| C9 | Lazy-load individual chart wrappers on the charts documentation page | `performance`, `docs`, `good first issue` |
| C10 | Add recharts to next.config.mjs's optimizePackageImports | `performance`, `tooling`, `good first issue` |
| C11 | Load the Inter font via next/font or remove the dead reference | `performance`, `css`, `good first issue` |
| C12 | Reuse the shared formatters instead of ad-hoc Intl.NumberFormat/toLocaleString calls | `cleanup`, `performance` |
| D1 | Fix TopHeader/Sidebar breakpoint mismatch causing a tablet layout gap | `css`, `dashboard`, `bug` |
| D2 | Add dark-mode support to EmptyState | `css`, `theming`, `bug`, `good first issue` |
| D3 | Align PortfolioDashboard's CSS module breakpoints with the app's Tailwind scale | `css`, `dashboard`, `refactor` |
| D4 | Establish a shared z-index scale for overlays | `css`, `cleanup`, `refactor` |
| D5 | Wire up (or remove) the dead TopHeader notification bell | `bug`, `dashboard`, `good first issue` |
| D6 | Bring Navbar icon buttons up to the app's 44px touch-target standard | `css`, `a11y`, `good first issue` |
| D7 | Fix the illegibly small "Sign out" control in Navbar | `css`, `a11y`, `good first issue` |
| D8 | Fix "Sign In" vs "Sign in" capitalization inconsistency across the auth flow | `docs`, `good first issue` |
| E1 | Route real-backend proxy calls through the existing authenticated server API client | `api`, `security`, `cleanup` |
| E2 | Standardize the HTTP status used for validation errors across API routes | `api`, `bug`, `good first issue` |
| E3 | Preserve real-backend error status instead of collapsing every failure to 503 | `api`, `bug` |
| E4 | Rewrite NEUROWEALTH_API.md and fix CONTRIBUTING.md's env-validation description | `docs`, `api`, `good first issue` |
| E5 | Validate the login page's `from` redirect parameter against open redirects | `security`, `bug` |
| E6 | Reconcile documented-but-unused deploy secrets (WALLET_ENCRYPTION_KEY, DB_*) with actual wallet storage | `security`, `docs` |
| E7 | Fix strategy PUT silently losing the user's selection when using the real backend | `api`, `bug` |
| E8 | Replace raw console.error calls with the shared PII-scrubbing logger | `security`, `cleanup`, `good first issue` |
| E9 | Fix portfolio API's misleading "showing preview data" error message | `api`, `bug`, `good first issue` |
| F1 | Remove dead "coming soon" alert() stubs for social login | `ux`, `cleanup`, `good first issue` |
| F2 | Replace OnboardingSettings' duplicate date formatter with the shared locale-aware one | `cleanup`, `good first issue` |
| F3 | Replace OnboardingSettings' hardcoded localStorage key strings with the storage-keys registry | `cleanup`, `good first issue` |
| F4 | Wire real signature verification into the session cookie, or document why it's deferred | `security`, `auth` |
| F5 | Gate the /demo/* routes behind the same dev-only guard as sandbox/async-states/dev-errors | `cleanup`, `good first issue` |
| F6 | Add test coverage for the i18n system | `testing`, `good first issue` |

## Full issue bodies

### [A1] Add visible focus ring to Switch toggle component

## Summary

The Switch component hides its real checkbox input and relies on `peer-focus:outline-none` on the visible track with no compensating focus ring, so keyboard users can't see which toggle is focused across Settings -> Notifications.

## Affected files

- `src/components/ui/Switch.tsx`
- `src/components/notifications/NotificationPreferences.tsx`

## Tasks

- Add `peer-focus-visible:ring-2 ring-offset-2` (or the app's existing focus token) to the visible track.
- Verify Tab order and focus visibility manually in both light and dark themes.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A2] Make TimePicker dropdown keyboard-operable

## Summary

Time-slot options only respond to onClick with no tabIndex/keydown/aria-activedescendant wiring, and the filter input has no Enter/ArrowDown handling -- keyboard-only users can open the picker but cannot select a time at all.

## Affected files

- `src/components/datetime/TimePicker.tsx`

## Tasks

- Add a roving-tabIndex or aria-activedescendant pattern to the option list.
- Wire ArrowUp/ArrowDown to move the highlight and Enter to select, without breaking the existing filter input.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A3] Fix TimePicker Escape-to-close once the filter input has focus

## Summary

Escape/ArrowDown handling is only attached to the trigger button; once autoFocus moves into the filter input, Escape no longer closes the panel.

## Affected files

- `src/components/datetime/TimePicker.tsx`

## Tasks

- Attach the same onKeyDown handler (or lift it to a shared scope) to the filter input.
- Add a regression check for Escape from within the filter input.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A4] Make DataTable rows actually keyboard-activatable as documented

## Summary

The component's own doc comment claims rows are keyboard-activatable via onRowClick, but neither the desktop <tr> nor the mobile <li> implementation sets tabIndex/onKeyDown/role="button" -- only mouse/touch actually works.

## Affected files

- `src/components/ui/DataTable.tsx`

## Tasks

- Add tabIndex=0, onKeyDown (Enter/Space), and role="button" on interactive rows when onRowClick is provided.
- Verify the doc comment matches the corrected behavior.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A5] Restore a visible focus state on the Audit Trail filter select

## Summary

The component's own <style> block sets `.audit-select { outline: none; }` with no `:focus-visible` replacement, so keyboard users get no visual indication when the event-type filter is focused.

## Affected files

- `src/components/audit/AuditTrail.tsx`

## Tasks

- Add a `:focus-visible` ring/outline rule for `.audit-select`.
- Check other `.audit-*` interactive elements in the same block for the same gap.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `css`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A6] Fix Audit Trail's non-functional "Show details" toggle on desktop and add aria-expanded

## Summary

The expand/collapse button updates its aria-label text but never sets aria-expanded, and the expanded detail region only renders in the mobile card layout -- on desktop, clicking "Show" on a table row produces no visible or announced change.

## Affected files

- `src/components/audit/AuditTrail.tsx`

## Tasks

- Render the expanded detail content in the desktop table layout too (e.g. an expandable row).
- Add aria-expanded reflecting the actual expanded state.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`, `dashboard`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A7] Fix low-contrast text in Audit Trail dark theme

## Summary

`.audit-ip` and `.audit-empty`/`.audit-empty-mobile` use #64748b on a dark panel background, computing to roughly 3.75-3.93:1 contrast -- below the WCAG AA 4.5:1 minimum for normal text.

## Affected files

- `src/components/audit/AuditTrail.tsx`

## Tasks

- Pick a lighter shade (or reuse an existing theme text-muted token) that clears 4.5:1 in dark mode.
- Verify light mode isn't regressed.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `css`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A8] Respect prefers-reduced-motion in Line/Bar/Area chart wrappers

## Summary

BaseChart computes prefersReducedMotion and exports a usePrefersReducedMotion hook, but only DonutChartWrapper consumes it to disable animation -- the other three chart wrappers keep animating for users with OS-level reduced motion enabled.

## Affected files

- `src/components/charts/BaseChart.tsx`
- `src/components/charts/LineChartWrapper.tsx`
- `src/components/charts/BarChartWrapper.tsx`
- `src/components/charts/AreaChartWrapper.tsx`

## Tasks

- Import usePrefersReducedMotion in the three remaining wrappers.
- Pass isAnimationActive={!prefersReducedMotion} consistently, matching DonutChartWrapper's existing pattern.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `dashboard`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A9] Give chart SVGs an accessible name

## Summary

None of the chart wrappers pass aria-label or role="img" to their container/ResponsiveContainer, so screen-reader users land on unlabeled graphics with no indication of what they represent.

## Affected files

- `src/components/charts/BaseChart.tsx`
- `src/components/charts/LineChartWrapper.tsx`
- `src/components/charts/BarChartWrapper.tsx`
- `src/components/charts/AreaChartWrapper.tsx`
- `src/components/charts/DonutChartWrapper.tsx`

## Tasks

- Add an aria-label prop (plumbed from each usage site, e.g. "Portfolio allocation by asset") to the chart container.
- Consider a visually-hidden data-table fallback for complex charts.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `dashboard`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A10] Wire aria-invalid/aria-describedby into deposit/withdraw form fields

## Summary

The amount and wallet-address inputs render plain <input> elements with separately-rendered error text that has no role="alert"/aria-live and isn't linked via aria-describedby -- screen-reader users get no announcement when submitting an invalid amount, even though the shared FormField component already implements this correctly elsewhere.

## Affected files

- `src/components/transactions/stages/TransactionFormStage.tsx`

## Tasks

- Reuse the existing FormField aria wiring pattern (aria-invalid, aria-describedby, live region) for these two inputs.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A11] Expose selection state on the theme selector buttons

## Summary

Light/Dark/System are three buttons distinguished only by a CSS "active" class, with no aria-pressed or radiogroup/aria-checked semantics -- a screen-reader user hears "button, button, button" with no way to tell which theme is currently selected.

## Affected files

- `src/app/dashboard/settings/preferences/page.tsx`

## Tasks

- Add aria-pressed (or convert to a proper radiogroup/radio pattern) reflecting draft.theme.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [A12] Fix notification bell's unread count being invisible to screen readers

## Summary

An explicit aria-label on the toggle button discards the visible unread-count badge's text content from the accessible name computation, so screen-reader users can't tell unread notifications exist; the popover also lacks aria-expanded/aria-haspopup and has no Escape-to-close handler.

## Affected files

- `src/components/notifications/NotificationToggle.tsx`

## Tasks

- Include the unread count in the aria-label (or move it into an aria-live region).
- Add aria-expanded/aria-haspopup and Escape-to-close handling.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`a11y`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B1] Add tests for normalizePortfolioPayload's real-backend response path

## Summary

normalizePortfolioPayload's field-fallback chains (summary/allocation/positions/activity) only run when NEUROWEALTH_API_BASE_URL is set, but the existing route test never sets it -- the normalizer that would run against a real backend has zero coverage.

## Affected files

- `src/lib/portfolio.ts`
- `src/app/api/portfolio/route.test.ts`

## Tasks

- Add tests that set NEUROWEALTH_API_BASE_URL and exercise normalizePortfolioPayload directly with a few representative backend response shapes, including the field-name variants it's meant to tolerate.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `api`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B2] Add unit tests for src/lib/user.ts

## Summary

This module is documented as the single source of truth reconciling mock vs. API user shapes (adaptMockAuthUser, adaptApiUser, getUserInitials, truncateWalletAddress, resolveDisplayName), but has no test file -- a backend field rename could silently fall back every user's display name to the literal string "User".

## Affected files

- `src/lib/user.ts`

## Tasks

- Add user.test.ts covering each adapter function's fallback chain and edge cases (missing fields, empty strings).

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### ~~[B3] Add unit tests for the service-layer adapters and remove `any` from their error types~~

> **Closed — superseded by #727 (August 2026).**
> `src/lib/service-layer/` was confirmed to have zero external imports and was
> removed entirely. The directory already had a full `node:test` suite
> (base-adapter, auth, portfolio, strategy, transaction) and typed error
> handling at the time of deletion. No further action required.

## Suggested labels

~~`testing`, `typescript`, `api`~~

---

### [B4] Add tests for the i18n locale-state singleton and locale-aware formatters

## Summary

activeLocale is a module-scope mutable singleton read by every currency/date/number formatter, but has no test file, and formatters.test.ts only exercises the default "en" locale -- actual locale-switch behavior is unverified.

## Affected files

- `src/lib/i18n/locale-state.ts`
- `src/lib/formatters.ts`

## Tasks

- Add locale-state.test.ts.
- Extend formatters.test.ts to cover at least one non-default locale end-to-end.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B5] Replace `t: any` with a typed message-namespace in dashboard components

## Summary

renderSourceLabel, statusLabel, and EventLog all accept `t: any`, so renaming or removing an i18n message key compiles cleanly and only fails at runtime as blank/undefined text in the UI.

## Affected files

- `src/components/dashboard/PortfolioDashboard.tsx`
- `src/components/dashboard/RealtimeDashboard.tsx`

## Tasks

- Type these functions against the actual messages.dashboard.* shape instead of `any`.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`typescript`, `cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B6] Add tests for useRealtimeStream's cumulative state and stop/reset guarding

## Summary

This hook maintains cumulative deltas, caps its event log at 50 entries, and relies on a ref-based guard inside a recursive setTimeout chain to stop scheduling after stop()/reset() -- none of it is tested, so a regression to the guard could leak timers that keep firing after "stop".

## Affected files

- `src/hooks/useRealtimeStream.ts`
- `src/components/dashboard/RealtimeDashboard.tsx`

## Tasks

- Add a test harness (fake timers) covering start/stop/reset transitions and the 50-event cap.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `dashboard`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B7] Resolve the two differently-shaped useDateFilter hooks

## Summary

useDateFilter.ts exports a tested, range-based useDateFilter<T>(data, range); useDateRangeFilter.ts separately defines its own internal-state useDateFilter(data) with a different signature and zero tests, and both are imported side-by-side in src/app/demo/datetime/page.tsx -- a future import of the wrong one silently changes filtering behavior with no compiler warning.

## Affected files

- `src/hooks/useDateFilter.ts`
- `src/hooks/useDateRangeFilter.ts`

## Tasks

- Rename one (e.g. the internal-state version to useLocalDateFilter) or consolidate them.
- Add tests to whichever version remains.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B8] Guard useNotifications' localStorage read against malformed JSON

## Summary

The initializer calls JSON.parse(stored) with no try/catch, unlike every comparable localStorage-read pattern elsewhere in the codebase (mock-services.ts, strategies.ts, notifications settings page) -- a corrupted or stale-schema value under the notifications storage key crashes the whole NotificationCenter on render.

## Affected files

- `src/hooks/useNotifications.ts`

## Tasks

- Wrap the parse in try/catch with a safe fallback, matching the codebase's existing pattern.
- Add a regression test with malformed stored JSON.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`bug`, `testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B9] Assert on actual response data in transaction-history route tests

## Summary

Every scenario in the existing test only asserts HTTP status and `success`, never data.items/data.page/data.totalPages -- so the real logic (inclusive date-range math, page clamping, totalPages calculation) is unverified and a regression would still return 200 while silently returning wrong data.

## Affected files

- `src/app/api/transaction-history/route.test.ts`
- `src/lib/transaction-history.ts`

## Tasks

- Extend the tests to assert on returned item counts, page numbers, and date-boundary inclusivity.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `api`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B10] Add direct unit tests for validation/api.ts's error-grouping helpers

## Summary

zodErrorToDetails and buildValidationDetails group multiple issues per field path, and transaction-utils.ts explicitly depends on specific path-string spellings -- but no route test asserts on error.details shape, only on the top-level error code, so a regression in the grouping/path-joining logic would go unnoticed.

## Affected files

- `src/lib/validation/api.ts`
- `src/components/transactions/utils/transaction-utils.ts`

## Tasks

- Add validation/api.test.ts covering multi-issue grouping and nested-path joining.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B11] Deduplicate transaction-utils logic hand-copied into TransactionFlow.tsx and add tests

## Summary

TransactionFlow.tsx re-implements its own near-identical copies of getToneClassName, getInputStateClassName, sanitizeAmount, and detailsToFieldErrors instead of importing from transaction-utils.ts (which TransactionFormStage.tsx does import from) -- the two copies can silently drift, and neither transaction-utils.ts nor this duplication has test coverage.

## Affected files

- `src/components/transactions/utils/transaction-utils.ts`
- `src/components/transactions/TransactionFlow.tsx`

## Tasks

- Have TransactionFlow.tsx import from transaction-utils.ts instead of maintaining its own copies.
- Add tests for the shared module.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `testing`, `refactor`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B12] Add tests for wallet/network mismatch detection

## Summary

detectWalletNetworkMismatch branches on wallet provider, calls out to the Freighter API, and compares network passphrases to decide whether to show a mismatch warning -- none of its branches are tested, and a regression here means the warning silently stops firing (or false-positives) for users connected to the wrong Stellar network.

## Affected files

- `src/lib/wallet-network-detection.ts`
- `src/components/wallet/NetworkMismatchWarning.tsx`

## Tasks

- Add tests mocking the Freighter API for each branch: non-Freighter provider, API throwing, passphrase undefined, mismatch, match.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `security`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [B13] Add tests for Pagination's page-window algorithm and remove its `any` cast

## Summary

getPageNumbers implements ellipsis-windowing logic with zero test coverage, and a keydown handler casts a KeyboardEvent to `any` to satisfy handleJump's FormEvent parameter -- harmless today only because handleJump merely calls preventDefault(), but a future change reading form-specific event properties would silently get the wrong runtime object.

## Affected files

- `src/components/pagination-filters/Pagination.tsx`

## Tasks

- Add unit tests for getPageNumbers across small/large/edge page counts.
- Fix the type mismatch instead of casting.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `typescript`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C1] Lazy-load the Stellar SDK / wallet-kit chain instead of importing it in every page's bundle

## Summary

A comment in layout.tsx claims "WalletProvider is loaded client-side only (ssr:false)", but no next/dynamic is actually used anywhere in this chain -- ClientProviders statically imports WalletProvider, which statically imports the Stellar SDK and 5 wallet-adapter modules, and this whole chain mounts unconditionally on every route including marketing/login pages where no wallet interaction happens on first paint. Separately, @stellar/freighter-api is already lazy-loaded correctly via dynamic import() in HeroActions.tsx -- wallet-network-detection.ts's static import of the same package should follow that existing pattern too.

## Affected files

- `src/components/ClientProviders.tsx`
- `src/contexts/WalletProvider.tsx`
- `src/lib/stellar-wallet-kit.ts`
- `src/lib/wallet-network-detection.ts`
- `src/app/layout.tsx`

## Tasks

- Convert WalletProvider (and its Stellar SDK/wallet-kit imports) to a next/dynamic(..., { ssr: false }) boundary, following the pattern already used correctly by CommandPalette.tsx.
- Only mount it where wallet interaction is actually possible.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `cleanup`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C2] Memoize PortfolioDashboard's chart data and add React.memo where render cost is high

## Summary

The codebase has zero React.memo usage anywhere; PortfolioDashboard (472 lines, no useMemo/useCallback) passes a freshly-allocated array to AllocationChart on every render, forcing Recharts to fully recompute layout/animation on unrelated re-renders (theme toggle, scenario switch).

## Affected files

- `src/components/dashboard/PortfolioDashboard.tsx`
- `src/components/charts/DonutChartWrapper.tsx`
- `src/components/charts/BaseChart.tsx`

## Tasks

- Wrap the allocation-data transform in useMemo.
- Consider React.memo on the chart wrapper components.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `dashboard`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C3] Code-split the dev-only DiagnosticsPanel out of the production bundle

## Summary

DiagnosticsPanel is statically imported and rendered in every page's tree; it only hides itself at runtime (NODE_ENV check / ?debug=true), so its code (plus LogViewer/EventMonitor/useDiagnostics) still ships in every visitor's production bundle -- unlike CommandPalette, which correctly wraps the same "rarely used" case in next/dynamic({ ssr: false }).

## Affected files

- `src/app/layout.tsx`
- `src/components/diagnostics/DiagnosticsPanel.tsx`

## Tasks

- Apply the same next/dynamic pattern CommandPalette already uses, gating the import behind the debug-flag check.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C4] Memoize AuditTrail's filter+sort computation

## Summary

events.filter(...).sort(...) runs directly in the render body with no useMemo, so unrelated state changes on the same component (row-expand toggle, page change) re-run a full filter+sort pass over the entire events array.

## Affected files

- `src/components/audit/AuditTrail.tsx`

## Tasks

- Wrap the filter+sort pipeline in useMemo keyed on events/filter/sortOrder.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C5] Remove unjustified force-dynamic from the public landing page

## Summary

The homepage sets `export const dynamic = "force-dynamic"` but nothing in its component tree uses cookies()/headers() or any other request-scoped API, so Next.js can't prerender or edge-cache the highest-traffic route for no functional reason.

## Affected files

- `src/app/page.tsx`

## Tasks

- Remove the force-dynamic export (or document why it's needed if something non-obvious requires it).
- Verify the page still builds/renders correctly statically.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C6] Lazy-load GlobalSearch instead of bundling it into every page via Navbar

## Summary

Navbar statically imports and renders the 406-line GlobalSearch (plus its 172-line mock index), so the full search UI ships in the initial bundle on every page including the landing page, even though search is an opt-in, below-the-fold interaction -- CommandPalette already demonstrates the correct next/dynamic({ssr:false}) pattern for the same scenario.

## Affected files

- `src/components/Navbar.tsx`
- `src/components/search/GlobalSearch.tsx`
- `src/lib/mock-search-index.ts`

## Tasks

- Convert GlobalSearch to load on demand (focus/click) via next/dynamic, matching CommandPalette's existing pattern.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `cleanup`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C7] Memoize SandboxContext's provider value

## Summary

updateScenario/getCurrentScenario/resetAllScenarios are plain functions and the context value is a new object literal every render, with no useMemo -- unlike I18nContext and ThemeProvider, which correctly memoize their context values -- and since SandboxProvider is the outermost provider in ClientProviders, any internal state change forces every useSandbox() consumer in the tree to re-render.

## Affected files

- `src/contexts/SandboxContext.tsx`

## Tasks

- Wrap the context value in useMemo and the action functions in useCallback, matching the pattern already used by I18nContext/ThemeProvider.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `cleanup`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C8] Memoize AuthContext's provider value

## Summary

signIn/signUp/signOut are plain functions and the context value is a fresh inline object every render; because AuthProvider also calls useRouter(), any router-triggered re-render regenerates the whole value and cascades re-renders to every useAuth() consumer (Navbar, dashboard pages, profile) regardless of whether user/loading actually changed.

## Affected files

- `src/contexts/AuthContext.tsx`

## Tasks

- Wrap signIn/signUp/signOut in useCallback and the context value in useMemo.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `cleanup`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C9] Lazy-load individual chart wrappers on the charts documentation page

## Summary

This 403-line page statically imports all four recharts wrapper components (Line/Area/Bar/Donut) up front instead of loading each demo section's wrapper only when its tab/section becomes visible, paying for the entire recharts surface area on page load.

## Affected files

- `src/app/docs/charts/page.tsx`

## Tasks

- Convert each wrapper import to next/dynamic, loaded per-tab or per-visible-section.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `docs`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C10] Add recharts to next.config.mjs's optimizePackageImports

## Summary

optimizePackageImports only lists lucide-react; recharts (imported across 6+ files) is the app's other large multi-export dependency and is a natural fit for this same tree-shaking optimization, currently left on the table.

## Affected files

- `next.config.mjs`

## Tasks

- Add "recharts" to the optimizePackageImports array and verify the build still produces correct output.
- Consider also removing the now-default-on `instrumentationHook` experimental flag in the same pass.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `tooling`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C11] Load the Inter font via next/font or remove the dead reference

## Summary

Inter is declared as the primary sans-serif typeface in both CSS variables and the Tailwind config, but no next/font, Google Fonts link, or local font file actually loads it anywhere in the repo -- every page silently falls back to the system font stack, so the intended brand typography never renders.

## Affected files

- `src/app/globals.css`
- `tailwind.config.ts`

## Tasks

- Either add next/font/google for Inter (self-hosted, zero-CLS), or remove the dead Inter reference so the config reflects reality.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`performance`, `css`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [C12] Reuse the shared formatters instead of ad-hoc Intl.NumberFormat/toLocaleString calls

## Summary

Several components construct their own Intl.NumberFormat instances or call toLocaleString directly instead of reusing src/lib/formatters.ts's existing formatCurrency/formatCompactNumber helpers, duplicating formatting logic and rebuilding formatter objects on every render in list-heavy components.

## Affected files

- `src/components/audit/AuditTrail.tsx`
- `src/components/pagination-filters/Pagination.tsx`
- `src/components/pagination-filters/StrategyList.tsx`
- `src/components/pagination-filters/TransactionList.tsx`
- `src/components/transactions/TransactionHistory.tsx`
- `src/hooks/useRealtimeStream.ts`

## Tasks

- Replace the ad-hoc calls with the shared formatters module.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `performance`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D1] Fix TopHeader/Sidebar breakpoint mismatch causing a tablet layout gap

## Summary

TopHeader offsets itself with md:left-64 (768px breakpoint, full 256px), but Sidebar only expands to w-64 at lg: (1024px) -- between 640-767px the header has no offset while the collapsed rail already overlaps it, and between 768-1023px the header reserves 256px while the sidebar is still only 56px wide, leaving a visible dead gap.

## Affected files

- `src/components/dashboard/TopHeader.tsx`
- `src/components/dashboard/Sidebar.tsx`
- `src/components/dashboard/DashboardShell.tsx`

## Tasks

- Align TopHeader's offset breakpoints with Sidebar's actual expand breakpoint (or vice versa), matching the pattern DashboardShell already uses correctly (sm:pl-14 / lg:pl-64).

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `dashboard`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D2] Add dark-mode support to EmptyState

## Summary

EmptyState hardcodes bg-sky-500/10 text-sky-400, text-slate-100, and text-slate-400 with no dark: variants, unlike its sibling EmptyStateCompact in the same file which correctly uses theme-adaptive tokens -- in light mode, EmptyState's near-white heading becomes nearly invisible.

## Affected files

- `src/components/ui/EmptyState.tsx`

## Tasks

- Replace the hardcoded colors with the same semantic tokens EmptyStateCompact already uses.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `theming`, `bug`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D3] Align PortfolioDashboard's CSS module breakpoints with the app's Tailwind scale

## Summary

This module uses bespoke max-width: 980px/720px/520px breakpoints while the rest of the dashboard shell is built on Tailwind's standard sm/md/lg (640/768/1024), so the page's internal grid can reflow at different widths than the surrounding chrome, looking "half-responsive".

## Affected files

- `src/components/dashboard/portfolio-dashboard.module.css`

## Tasks

- Convert the custom media queries to align with the app's standard breakpoint scale.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `dashboard`, `refactor`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D4] Establish a shared z-index scale for overlays

## Summary

Overlay z-index values are scattered ad-hoc (z-50, z-[60], z-[70], z-[80]/z-[81], z-[100], z-[9999] used in multiple unrelated places) with no defined scale -- Modal and Drawer share the exact same z-50, so if both are ever triggered together, stacking order is DOM-order-dependent rather than intentional.

## Affected files

- `src/components/ui/Modal.tsx`
- `src/components/ui/Drawer.tsx`
- `src/components/cookie/CookieBanner.tsx`
- `src/components/notifications/NotificationToggle.tsx`
- `src/components/search/GlobalSearch.tsx`
- `src/components/cookie/PrivacyModal.tsx`
- `src/components/Navbar.tsx`
- `src/components/notifications/ToastProvider.tsx`
- `src/components/diagnostics/DiagnosticsPanel.tsx`

## Tasks

- Define a small z-index scale (Tailwind theme extension or CSS custom properties) covering overlay/dropdown/modal/toast/dev-tool layers.
- Migrate the listed components to it.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `cleanup`, `refactor`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D5] Wire up (or remove) the dead TopHeader notification bell

## Summary

The notification bell button has aria-label="Notifications" but no onClick handler at all, and is sized 36px, under the app's own documented 44px touch-target standard (used by Sidebar and MobileBottomNav) -- tapping it on mobile/tablet does nothing.

## Affected files

- `src/components/dashboard/TopHeader.tsx`

## Tasks

- Wire it to open the existing NotificationCenter/NotificationToggle flow, or remove it if redundant with a nav link elsewhere.
- Bump the touch target to 44px either way.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`bug`, `dashboard`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D6] Bring Navbar icon buttons up to the app's 44px touch-target standard

## Summary

ThemeToggle (~34px), NotificationToggle (~34-36px), and Navbar's mobile search button (40px) all undershoot the 44px minimum that Sidebar.tsx and MobileBottomNav.tsx explicitly document and enforce elsewhere in the same navigation surface.

## Affected files

- `src/components/ThemeToggle.tsx`
- `src/components/notifications/NotificationToggle.tsx`
- `src/components/Navbar.tsx`

## Tasks

- Increase padding/hit-area on these three controls to meet the existing 44px standard.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `a11y`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D7] Fix the illegibly small "Sign out" control in Navbar

## Summary

The sign-out button has no padding or min-height classes at all -- its clickable area is just the raw glyph box of 10px uppercase text, sitting next to equally tiny account-info text, making it both hard to read and hard to tap.

## Affected files

- `src/components/Navbar.tsx`

## Tasks

- Add appropriate padding/min-height and consider a slightly larger font size for legibility.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`css`, `a11y`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [D8] Fix "Sign In" vs "Sign in" capitalization inconsistency across the auth flow

## Summary

The navbar and signup footer link both read "Sign In" (title case, from messages.ts), but the login page itself and the unauthorized page consistently use "Sign in" (sentence case) -- a small but visible copy inconsistency in core auth microcopy.

## Affected files

- `src/lib/i18n/messages.ts`
- `src/components/Navbar.tsx`
- `src/app/(auth)/signup/page.tsx`
- `src/app/login/page.tsx`
- `src/app/(errors)/unauthorized/page.tsx`

## Tasks

- Pick one casing convention and apply it consistently across all five files.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`docs`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E1] Route real-backend proxy calls through the existing authenticated server API client

## Summary

Each route handler hand-rolls its own fetch()/resolveEndpoint() (duplicated 3x) and never sets an Authorization header, even though src/lib/api-client.ts already exports a tested createServerApiClient() built specifically to auto-inject Authorization: Bearer <token> for route handlers -- once a real backend is configured, every proxied request would silently go out unauthenticated.

## Affected files

- `src/app/api/portfolio/route.ts`
- `src/app/api/transactions/route.ts`
- `src/app/api/strategy/route.ts`
- `src/lib/api-client.ts`

## Tasks

- Refactor the three route handlers to use createServerApiClient() instead of hand-rolled fetch calls.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`api`, `security`, `cleanup`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E2] Standardize the HTTP status used for validation errors across API routes

## Summary

strategy/route.ts returns 422 for VALIDATION_ERROR while the other three routes return 400 for the identical error code -- a client-side handler keyed on status code treats the same failure differently depending on which endpoint it hit.

## Affected files

- `src/app/api/strategy/route.ts`
- `src/app/api/portfolio/route.ts`
- `src/app/api/transactions/route.ts`
- `src/app/api/transaction-history/route.ts`

## Tasks

- Pick one status (400 is used by 3 of 4 routes) and align strategy/route.ts to match.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`api`, `bug`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E3] Preserve real-backend error status instead of collapsing every failure to 503

## Summary

When the real backend responds with any non-OK status, the handler ignores response.status entirely and always returns BACKEND_ERROR/503 -- a genuine backend-side validation rejection (e.g. its own 400) is reported to the frontend as an infrastructure outage.

## Affected files

- `src/app/api/transactions/route.ts`

## Tasks

- Map the backend's actual status where reasonable, reserving 503 for genuine connectivity/outage failures.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`api`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E4] Rewrite NEUROWEALTH_API.md and fix CONTRIBUTING.md's env-validation description

## Summary

The API contract doc's error-code table, portfolio response shape, and transaction-history endpoint documentation all contradict the real implementation (wrong error codes, wrong response fields, documents a GET /api/transactions endpoint that doesn't exist, documents POST for strategy updates when the route is actually PUT) -- a contributor implementing a real backend from this doc would build something the frontend can't call. Separately, CONTRIBUTING.md claims `yarn validate:env` validates against "Zod schemas", but the actual scripts use hand-rolled string checks with no Zod involved anywhere.

## Affected files

- `NEUROWEALTH_API.md`
- `CONTRIBUTING.md`
- `src/lib/api-response.ts`
- `src/lib/portfolio.ts`
- `src/app/api/strategy/route.ts`

## Tasks

- Rewrite NEUROWEALTH_API.md's error codes, response shapes, and endpoint list to match the real route handlers.
- Correct the Zod claim in CONTRIBUTING.md.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`docs`, `api`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E5] Validate the login page's `from` redirect parameter against open redirects

## Summary

The `from` query parameter is read straight from the URL and passed directly to router.replace(from) with no same-origin/relative-path check -- a crafted link like /login?from=//attacker.example sent to a user results in post-login navigation to an attacker-controlled destination.

## Affected files

- `src/app/login/page.tsx`

## Tasks

- Add a same-origin/relative-path guard (reject absolute URLs or anything not starting with a single `/`) before using `from` for navigation.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`security`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E6] Reconcile documented-but-unused deploy secrets (WALLET_ENCRYPTION_KEY, DB_*) with actual wallet storage

## Summary

server-env.ts enforces WALLET_ENCRYPTION_KEY and DB_* as required deploy secrets and docs/deployment.md instructs operators to provision them, but no application code consumes them -- meanwhile wallet-persistence.ts stores the wallet's public key/provider in plaintext localStorage, creating a false impression that wallet data is encrypted server-side.

## Affected files

- `scripts/lib/server-env.ts`
- `docs/deployment.md`
- `src/lib/wallet-persistence.ts`

## Tasks

- Either wire WALLET_ENCRYPTION_KEY into real encryption of persisted wallet data, or remove the unused required-secret checks and update the deployment docs to reflect actual behavior.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`security`, `docs`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E7] Fix strategy PUT silently losing the user's selection when using the real backend

## Summary

On a successful real-backend response, the handler returns the backend's response without ever writing the STRATEGY_COOKIE_KEY cookie (that write only happens in the local-fallback branch) -- if the backend later becomes unreachable, GET falls back to reading the never-updated cookie, silently reverting the displayed strategy to an old/default value instead of the user's last saved choice.

## Affected files

- `src/app/api/strategy/route.ts`

## Tasks

- Set the strategy cookie on the real-backend success path too, so the local fallback stays in sync with the last known-good value.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`api`, `bug`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E8] Replace raw console.error calls with the shared PII-scrubbing logger

## Summary

These call sites log raw Error objects directly via console.error instead of the shared logger, which explicitly documents avoiding exactly that pattern because .message can contain user input -- they weren't touched by the recent PII-audit commit.

## Affected files

- `src/components/onboarding/steps/StrategyOverviewStep.tsx`
- `src/components/settings/OnboardingSettings.tsx`
- `src/lib/onboarding-state.ts`

## Tasks

- Replace the raw console.error calls with the shared logger import used elsewhere in the codebase.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`security`, `cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [E9] Fix portfolio API's misleading "showing preview data" error message

## Summary

On backend fetch failure, the handler returns an error message claiming "Showing preview data," but the response has success: false and no data field at all -- no fallback data is actually returned, unlike strategy/route.ts which genuinely falls back to real cookie-derived data on the same class of failure.

## Affected files

- `src/app/api/portfolio/route.ts`

## Tasks

- Either implement an actual fallback/preview-data response for this failure path (matching strategy/route.ts's pattern), or correct the misleading message.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`api`, `bug`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F1] Remove dead "coming soon" alert() stubs for social login

## Summary

The Google/GitHub sign-in buttons call alert("... coming soon.") -- a jarring, non-dismissible native browser dialog for a feature that isn't implemented, inconsistent with the rest of the app's toast/inline-banner UI patterns.

## Affected files

- `src/app/login/page.tsx`

## Tasks

- Either remove the buttons until the providers are implemented, or replace the alert() with a disabled state plus tooltip/inline note using the app's existing UI primitives.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`ux`, `cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F2] Replace OnboardingSettings' duplicate date formatter with the shared locale-aware one

## Summary

This component defines its own hardcoded en-US date formatter instead of using the shared, locale-aware formatDate already used elsewhere post-i18n-migration, so it won't respect a user's selected locale.

## Affected files

- `src/components/settings/OnboardingSettings.tsx`
- `src/lib/formatters.ts`

## Tasks

- Replace the local formatter with the shared one from formatters.ts.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F3] Replace OnboardingSettings' hardcoded localStorage key strings with the storage-keys registry

## Summary

This component (and related onboarding files) hardcode raw localStorage key string literals instead of using the centralized storage-keys.ts registry -- the existing open issue #341 only covers the sandbox files, not this one.

## Affected files

- `src/components/settings/OnboardingSettings.tsx`
- `src/lib/storage-keys.ts`

## Tasks

- Add/reuse entries in storage-keys.ts and update OnboardingSettings to reference them instead of string literals.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F4] Wire real signature verification into the session cookie, or document why it's deferred

## Summary

AUTH_SECRET is documented in .env.example and docs/env.md as used for "JWT secret used for middleware cookie verification", but it's never referenced anywhere in the codebase -- the actual session-cookie check only verifies the cookie decodes to JSON with a token string and a future expiresAt, with no signature check, so any client-side JS can fabricate a valid-looking session cookie and pass every route guard.

## Affected files

- `middleware.ts`
- `src/contexts/AuthContext.tsx`
- `.env.example`

## Tasks

- Either implement real signing/verification using AUTH_SECRET ahead of any real backend integration, or explicitly document that this is intentionally deferred while the app is mock-only, and remove the misleading AUTH_SECRET documentation until it's real.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`security`, `auth`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F5] Gate the /demo/* routes behind the same dev-only guard as sandbox/async-states/dev-errors

## Summary

/dashboard/sandbox, /dashboard/async-states, and /dashboard/dev-errors are all properly NODE_ENV-gated, but the 7 pages under /demo/* are reachable in production with no equivalent guard.

## Affected files

- `src/app/demo`

## Tasks

- Apply the same dev-only gating pattern to /demo/* routes, or move them under /dashboard/sandbox if they're meant to stay reachable in dev only.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`cleanup`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

### [F6] Add test coverage for the i18n system

## Summary

The i18n system (1,100+ line messages catalog, context provider, used across 18+ files) shipped with zero unit tests -- a missing/mistyped key currently fails silently at runtime rather than at build or test time.

## Affected files

- `src/lib/i18n/messages.ts`
- `src/lib/i18n/I18nContext.tsx`

## Tasks

- Add tests covering I18nContext's locale-switch behavior and at least a schema/shape check ensuring all locales export the same key set as the default.

## Acceptance criteria

- [ ] Scope is limited to the files listed (or agreed alternatives in the PR).
- [ ] Change is verifiable: tests, screenshots, or written QA steps in the PR.
- [ ] No behavior regressions in related user flows.
- [ ] No new duplicate abstractions without a one-line rationale in the PR.

## Suggested labels

`testing`, `good first issue`

## Notes

Sourced from a July 2026 codebase audit (accessibility, testing/type-safety, performance, UX/responsive, and API/security/docs passes) against current `main`. Distinct from the already-tracked cleanup batch (#328-#350) and Next.js upgrade (#128).

---

