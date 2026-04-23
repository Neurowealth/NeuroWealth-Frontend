# VQA-85 — Replace notifications data placeholder with final list UI

## Owner

`@peternnadi1999`

## Severity

Medium

## Surface

`/dashboard/notifications`

## Problem

The notifications page empty state is implemented, but the non-empty state still renders placeholder body copy (`Notifications content goes here.`). This prevents a final visual QA sign-off for the populated state.

## Evidence

- Page file: `src/app/dashboard/notifications/page.tsx`
- Baseline references: `docs/qa/baselines/2026-03-28/*notifications__data.png`

## Acceptance Criteria

- Data state renders the intended notification list UI instead of placeholder text.
- Desktop and mobile layouts use consistent list density, spacing, and affordances.
- Updated screenshots replace the affected baseline images.