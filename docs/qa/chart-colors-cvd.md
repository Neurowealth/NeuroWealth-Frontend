# Chart Colors & CVD Accessibility (Issue #422)

## Scope

Owner: frontend data visualization.

This check covers the shared chart tokens in `src/lib/chart-theme.ts`, the CVD
utilities in `src/lib/chart-colors-cvd.ts`, the Recharts wrappers in
`src/components/charts/*`, and the visible chart reference page at
`/docs/charts`.

## Approved Palette

The active chart tones are token-backed and must be used instead of ad hoc hex
values.

| Tone             | Hex       | Redundant pattern | Use case                         |
| ---------------- | --------- | ----------------- | -------------------------------- |
| `primary`        | `#0284c7` | Solid             | Main series and portfolio trend  |
| `accent`         | `#d55e00` | Dash              | Secondary series and yield bars  |
| `warning`        | `#cc79a7` | Dot               | Third series and comparisons     |
| `neutral-strong` | `#64748b` | Long dash         | Other/inactive/supporting slices |

Supporting `neutral-soft` remains available for low-emphasis UI chrome and
labels, but it is not part of the active multi-series palette.

## Automated Verification

Run:

```bash
npx tsx scripts/verify-chart-contrast.ts
```

The script verifies:

- WCAG AA graphics contrast (`3:1`) against the dark chart surface `#111827`.
- WCAG AA graphics contrast (`3:1`) against light chart backgrounds `#ffffff`.
- Simulated pairwise RGB distance for protanopia, deuteranopia, and tritanopia.
- Minimum simulated CVD pair distance of `35` for every active palette pair.

Unit coverage lives in `src/lib/chart-colors-cvd.test.ts` and checks the same
critical requirements during `yarn test`.

## Manual QA

1. Open `/docs/charts`.
2. Confirm the palette swatches show sky, orange, magenta, and slate.
3. Confirm bar examples use dashed/dotted outlines where configured.
4. Confirm donut slices show both color and stroke-pattern differences.
5. Verify tooltips and legends provide labels so color is not the only carrier
   of meaning.
6. Optional: capture the chart page and inspect it in a CVD simulator for
   protanopia, deuteranopia, and tritanopia.

## Design Notes

- The previous palette had a blue value that missed the `3:1` graphics threshold
  on the actual dark chart surface by a small margin.
- Teal/green-adjacent colors can collapse under tritanopia and some red-green
  simulations, so the third active tone uses magenta instead of teal.
- Pattern redundancy is applied through shared stroke-dasharray tokens. This is
  intentionally lightweight because the current wrappers mostly render
  single-series line/bar charts and tone-based donut slices.

## References

- WCAG 2.1 Non-text Contrast: https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html
- WCAG 2.1 Contrast Minimum: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
- CVD simulator for optional manual review: https://www.color-blindness.com/coblis-color-blindness-simulator/
