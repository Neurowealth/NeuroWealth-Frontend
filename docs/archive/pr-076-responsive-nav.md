## Description

This PR resolves [#76](https://github.com/Mrwicks00/NeuroWealth-Frontend/issues/76) by implementing fully responsive navigation variants across all four target breakpoints and delivering a documented QA matrix.

### Changes Made

#### `src/components/dashboard/Sidebar.tsx` — Full Rewrite
- **Mobile (`< 640px`):** Sidebar remains hidden; `MobileBottomNav` handles navigation.
- **Tablet (`640–1023px`):** New collapsed icon-only rail (56px wide) with a `ChevronRight/Left` toggle button to manually expand to full 256px width.
- **Desktop (`≥ 1024px`):** Always renders at full 256px width; toggle button hidden.
- **Hover tooltips** appear over each icon in the collapsed tablet state via absolute-positioned `role="tooltip"` spans.
- **Active state** now uses a combined visual signal: `bg-primary/15` tint + 3px left border accent + `text-primary` + `font-semibold` + heavier icon `stroke-[2.25]` + `aria-current="page"`.
- All nav links enforce `min-h-[44px]` (touch target spec) and `focus-visible:ring-2` keyboard indicator.

#### `src/components/dashboard/MobileBottomNav.tsx`
- Changed visibility from `md:hidden` → `sm:hidden` to align with the 640px breakpoint.
- Each tab item fills 100% height of the 64px bar (`h-16`) for guaranteed 44px touch compliance.
- Active tab uses `stroke-[2.25]` icon weight; inactive uses `stroke-[1.75]`.
- `aria-current="page"` applied on active item.

#### `src/components/dashboard/DashboardShell.tsx`
- Updated `<main>` padding offsets:
  - `sm:pl-14` (56px) to clear the collapsed tablet sidebar rail.
  - `lg:pl-64` (256px) for full desktop sidebar.
  - `pb-20` bottom padding scoped to `< sm` only to clear the mobile bottom nav.

#### `docs/responsive-nav-qa-matrix.md` — New File
- Full breakpoint behaviour table (Mobile / Tablet / Desktop / Wide).
- Touch & pointer target compliance table.
- Active state property breakdown.
- Keyboard navigation proof table.
- Overflow behaviour notes.
- Screenshot placeholder slots for reviewers.

### Verification List
- [x] `yarn lint` — `✔ No ESLint warnings or errors`
- [x] Sidebar hidden on mobile, icon rail on tablet, full on desktop
- [x] All interactive elements meet `min-h-[44px]` touch target requirement
- [x] Toggle button meets `min-h-[36px]` pointer target requirement
- [x] Active nav item has `bg-primary/15` + left border + `aria-current="page"`
- [x] Keyboard focus ring (`focus-visible:ring-2 focus-visible:ring-primary`) on all nav elements
- [x] Collapsed-state tooltips appear on hover (tablet only)
- [x] QA matrix documented in `docs/responsive-nav-qa-matrix.md`

## Screenshots / Demo

> *(Attach screenshots at each breakpoint and a short GIF showing keyboard navigation and touch interaction before merging.)*
>
> Suggested captures:
> - `screenshot-mobile-375.png` — MobileBottomNav with active state
> - `screenshot-tablet-768-collapsed.png` — icon rail + tooltip hover
> - `screenshot-tablet-768-expanded.png` — manually expanded sidebar
> - `screenshot-desktop-1280.png` — full sidebar with active link
> - `demo-keyboard-nav.gif` — Tab → Enter navigation flow

Closes #76
