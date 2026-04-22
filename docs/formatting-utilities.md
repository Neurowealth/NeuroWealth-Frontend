# Formatting Utilities

Issue `#93` adds locale-aware helpers for:

- `formatCurrency`
- `formatPercent`
- `formatNumber`
- `formatCompactNumber`
- `formatFullPrecision`
- `FormattedValue`

Expected behavior:

- Currency defaults to 2 decimal places
- Percent values keep 2 to 4 decimal places by default
- Compact formatting is available for large-number overview widgets
- Full precision is exposed through the `title` tooltip on `FormattedValue`
- Positive values render green, negative values render red, and zero stays neutral

Current usage examples:

- `src/components/dashboard/PortfolioDashboard.tsx`
- `src/app/dashboard/history/page.tsx`
- `src/app/dashboard/formatting/page.tsx`
