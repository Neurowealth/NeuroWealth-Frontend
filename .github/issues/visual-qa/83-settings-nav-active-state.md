# VQA-83 — Apply active-state styling in dashboard settings navigation

## Owner

`@peternnadi1999`

## Severity

Medium

## Surface

`/dashboard/settings/preferences`  
`/dashboard/settings/security`  
`/dashboard/settings/notifications`

## Problem

The settings navigation defines `.settings-nav-link.active` styles, but the links are rendered without an active-state class. As a result, current location is visually ambiguous on both desktop and mobile.

## Evidence

- Layout file: `src/app/dashboard/settings/layout.tsx`
- Baseline references: `docs/qa/baselines/2026-03-28/*settings-*.png`

## Acceptance Criteria

- Active route styling is applied to the current settings section.
- Mobile and desktop navigation both show clear orientation.
- Updated screenshots replace the affected baseline images.