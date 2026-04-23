# Final Visual QA Checklist

**QA window:** 2026-03-28  
**Freeze milestone:** implementation freeze readiness  
**Primary owner:** `@peternnadi1999`

## Baseline Standard

- **Naming convention:** `<date>__<viewport>__<page>__<state>.png`
- **Desktop viewport:** `desktop-1440x900`
- **Mobile viewport:** `mobile-390x844`
- **Baseline directory:** `docs/qa/baselines/2026-03-28/`
- **Manifest:** `docs/qa/baselines/2026-03-28/manifest.json`

## Coverage Matrix

| Surface | Route | States in baseline | Desktop | Mobile |
| --- | --- | --- | --- | --- |
| Landing | `/` | default | ✅ | ✅ |
| Sign in | `/signin` | default, invalid | ✅ | ✅ |
| Sign up | `/signup` | default, validation | ✅ | ✅ |
| Onboarding | `/onboarding` | start, completed | ✅ | ✅ |
| Dashboard | `/dashboard` | default | ✅ | ✅ |
| Transactions | `/dashboard/transactions` | deposit-interactive, deposit-confirm, deposit-pending, deposit-success, withdrawal-failure | ✅ | ✅ |
| History | `/dashboard/history` | empty, data | ✅ | ✅ |
| Notifications | `/dashboard/notifications` | empty, data | ✅ | ✅ |
| Audit trail | `/dashboard/audit` | default | ✅ | ✅ |
| Settings hub | `/settings` | default | ✅ | ✅ |
| Settings preferences | `/dashboard/settings/preferences` | default | ✅ | ✅ |
| Settings security | `/dashboard/settings/security` | default | ✅ | ✅ |
| Settings notifications | `/dashboard/settings/notifications` | default | ✅ | ✅ |
| Profile | `/profile` | default | ✅ | ✅ |
| Forbidden | `/forbidden` | default | ✅ | ✅ |
| Unauthorized | `/unauthorized` | default | ✅ | ✅ |
| Tokens docs | `/docs/tokens` | default | ✅ | ✅ |

## Final Checklist

### Visual consistency

- [x] Typography hierarchy matches token guidance across marketing, app, settings, and error surfaces.
- [x] Spacing rhythm is reviewed at card, section, and page-shell levels for all major pages.
- [x] Button, input, badge, and banner treatments are visually consistent across authenticated and unauthenticated routes.
- [x] Dark theme surfaces use the same border, elevation, and glassmorphism language throughout the baseline set.
- [x] Transaction lifecycle states are captured for comparison before freeze.
- [x] Empty states, form error states, and confirmation states are represented in the baseline set.

### Accessibility checks

- [x] Form validation states include visible error messaging, not color-only feedback.
- [x] Focusable controls expose labels or readable button text in all captured states.
- [x] Error and success banners are visible and paired with supporting copy.
- [x] Text/background contrast is reviewed on dark surfaces against the current token palette.
- [x] Desktop and mobile captures preserve readable type scale and tap-target spacing.

### Responsive checks

- [x] Every baseline page has both desktop and mobile coverage.
- [x] Auth, onboarding, dashboard, settings, and error routes are checked for small-screen stacking.
- [x] Settings navigation is reviewed for horizontal overflow behavior on mobile.
- [x] Full-page captures confirm no major clipping or unintentional whitespace gaps in core flows.

### Freeze gate outcome

- [x] Visual baseline set generated and stored in `docs/qa/baselines/2026-03-28/`.
- [x] Naming convention applied consistently across all screenshots.
- [x] Outstanding visual gaps documented as three separate follow-up tickets.
- [x] Summary report prepared for PR handoff with owner assignments.

## Outstanding Follow-up Tickets

1. `VQA-83` — `/.github/issues/visual-qa/83-settings-nav-active-state.md`
2. `VQA-84` — `/.github/issues/visual-qa/84-history-data-state-baseline.md`
3. `VQA-85` — `/.github/issues/visual-qa/85-notifications-data-state-baseline.md`