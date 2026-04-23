# VQA-84 — Replace history data placeholder with final data-state UI

## Owner

`@peternnadi1999`

## Severity

Medium

## Surface

`/dashboard/history`

## Problem

The history page empty state is designed, but the non-empty state still renders placeholder body copy (`Transaction history content goes here.`). This creates a visible quality gap in baseline comparisons and blocks a final data-state visual sign-off.

## Evidence

- Page file: `src/app/dashboard/history/page.tsx`
- Baseline references: `docs/qa/baselines/2026-03-28/*history__data.png`

## Acceptance Criteria

- Data state renders a final card or table layout rather than placeholder text.
- Mobile and desktop versions follow the same spacing and typography system as other dashboard surfaces.
- Updated screenshots replace the affected baseline images.