# Accessibility Audit — NeuroWealth Frontend

**Standard:** WCAG 2.1 AA  
**Audit date:** 2026-06-24  
**Scope:** All key user flows — landing, sign-up, sign-in, dashboard, settings, profile, onboarding, help

---

## Summary

| Category | Status | Notes |
|---|---|---|
| Skip link | ✅ Pass | Present in root layout, visible on focus |
| Focus indicators | ✅ Pass (post-fix) | 2 px sky-400 outline on all interactive elements |
| Keyboard navigation | ✅ Pass | Tab order follows DOM order; modals trap focus |
| Screen reader labels | ✅ Pass | ARIA labels on all icon-only buttons |
| Form accessibility | ✅ Pass | Labels + `aria-describedby` linking errors/hints |
| Color contrast (text) | ✅ Pass | slate-50 / slate-100 on dark-900 ≥ 7:1 |
| Color contrast (interactive) | ✅ Pass | sky-400 on dark-900 ≥ 4.6:1 |
| Error identification | ✅ Pass | `role="alert"` + `aria-invalid` on invalid fields |
| Session restore | ✅ Pass | `loading` state prevents flash; fallback rendered |
| Reduced-motion | ✅ Pass | Skeletons static; transitions disabled globally |
| Language attribute | ✅ Pass | `<html lang="en">` on root layout |
| Page titles | ✅ Pass | Next.js metadata with `%s | NeuroWealth` template |

---

## Issues Found and Fixed (this PR)

### A11Y-01 — Focus ring opacity too low on auth form inputs (WCAG 2.4.11)

**Severity:** High  
**File:** `src/app/(auth)/signup/page.tsx`  
**Before:** `focus:ring-sky-400/15` — ring rendered at 15 % opacity, invisible against dark background.  
**After:** `focus:ring-sky-400` — full-opacity 2 px ring matching the primary colour token.  
**Criteria:** WCAG 2.4.11 Focus Appearance (AA in WCAG 2.2) requires focus indicators to have ≥ 3:1 contrast against adjacent colours.

### A11Y-02 — Auth card width exceeded spec, causing horizontal scroll on narrow viewports (WCAG 1.4.10)

**Severity:** Medium  
**Files:** `src/app/login/page.tsx`, `src/app/(auth)/signup/page.tsx`  
**Before:** `max-w-sm` (384 px) on login; `max-w-xl` (576 px) on signup — signup card overflowed on 390 px mobile.  
**After:** `max-w-[420px]` on both, matching design spec.  
**Criteria:** WCAG 1.4.10 Reflow — content must be usable at 320 px viewport width without horizontal scroll.

### A11Y-03 — Form inputs below 44 px minimum touch target (WCAG 2.5.5)

**Severity:** Medium  
**Files:** `src/app/login/page.tsx`, `src/app/(auth)/signup/page.tsx`  
**Before:** `py-3` (12 px × 2 padding) + ~16 px text ≈ 40 px total height.  
**After:** Added `min-h-11` (44 px) ensuring the spec minimum is met even with smaller text or zoom.  
**Criteria:** WCAG 2.5.5 Target Size recommends ≥ 44 × 44 px for interactive controls.

---

## Patterns Verified Correct

### Skip link (`src/app/layout.tsx`)

```html
<a href="#main-content"
   class="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4
          focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg
          focus:bg-sky-500 focus:text-white focus:font-semibold
          focus:shadow-lg focus:outline focus:outline-2
          focus:outline-offset-2 focus:outline-white">
  Skip to main content
</a>
```

Confirmed: appears as first focusable element; target landmark has `tabIndex={-1}`.

### Modal and Drawer focus trap (`src/lib/focusTrap.ts`)

- Focus is trapped within the overlay on open.
- `Escape` key closes and returns focus to the trigger.
- `aria-modal="true"`, `role="dialog"`, and `aria-labelledby` are present on both components.

### Form field error associations (`src/components/ui/FormField.tsx`)

All form inputs use:
```tsx
aria-describedby={joinDescribedBy(hintId, errorId)}
aria-invalid={Boolean(error)}
```
Error messages rendered via `<FieldError>` carry `role="alert"` via the `InlineBanner` base.

### Skeleton loading states (`src/components/ui/Skeleton.tsx`)

All skeleton presets carry `aria-hidden="true"` and `role="presentation"` so screen readers do not announce loading placeholders. Live regions on page content areas announce when real data arrives.

### Notification and status announcements

- `aria-live="assertive"` on error alerts (`role="alert"` elements).
- `aria-live="polite"` on success status messages (`role="status"` elements).
- `aria-busy` set on inputs during async validation (email uniqueness check).

### Chart accessibility (`src/components/charts/BaseChart.tsx`)

`BaseChart` wraps all Recharts chart containers with:
- `role="img"`
- `aria-label` describing the chart and data for assistive technology

All chart wrappers (`AreaChartWrapper`, `BarChartWrapper`, `DonutChartWrapper`, `LineChartWrapper`) pass accessible `aria-label` strings.

---

## Keyboard Navigation — Tested Flows

| Flow | Method | Verified |
|---|---|---|
| Landing → Sign Up | Tab to "Connect Wallet" / "Open Dashboard" | ✅ |
| Sign-up form | Tab through all fields → submit | ✅ |
| Sign-in (demo) | Tab to button → Enter | ✅ |
| Dashboard sidebar nav | Tab through nav items | ✅ |
| Command palette | Keyboard shortcut → search → arrow keys → Enter | ✅ |
| Modal open/close | Enter to open → Escape to close; focus returns to trigger | ✅ |
| Notification panel | Tab to toggle → Enter → Tab through items | ✅ |
| Settings toggles | Tab → Space to toggle | ✅ |

---

## Remaining Recommendations (Post-MVP)

| ID | Description | Priority |
|---|---|---|
| A11Y-04 | Add `<title>` to SVG icons that carry semantic meaning (wallet icon in onboarding) | Low |
| A11Y-06 | Consider `aria-live="polite"` on the sandbox scenario switcher to announce state changes | Low |
| A11Y-07 | Add `autocomplete` attributes to sign-in/sign-up fields (e.g. `autocomplete="email"`) | Low |

### Resolved Recommendations

| ID | Description | Resolution |
|---|---|---|
| A11Y-05 | Recharts charts need `role="img"` + `aria-label` describing the data for non-visual access | ✅ Resolved — `BaseChart.tsx` provides `role="img"` and `aria-label`; all chart wrappers pass accessible labels. |

---

## Tooling Used

- Manual keyboard-only navigation audit (Tab, Shift+Tab, Enter, Space, Escape, Arrow keys)
- Chrome DevTools — Accessibility tree inspection
- Colour contrast checked via WebAIM Contrast Checker against design tokens in `globals.css`
- `prefers-reduced-motion` verified via Chrome `Rendering` panel override
