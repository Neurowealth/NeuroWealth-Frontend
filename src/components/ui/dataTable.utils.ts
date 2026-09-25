/**
 * Pure, framework-free helpers for the {@link DataTable} component (Issue #462).
 *
 * Kept JSX/React-free so the sorting + filtering logic can be unit tested
 * directly with `node:test` (see `DataTable.test.ts`).
 */

export type SortDirection = "asc" | "desc" | null;

/** A value we know how to sort/search/compare. */
export type CellValue = string | number | boolean | null | undefined;

/**
 * Cycle a column's sort state on repeated header clicks:
 * `none → asc → desc → none`.
 */
export function cycleSortDirection(current: SortDirection): SortDirection {
  if (current === null) return "asc";
  if (current === "asc") return "desc";
  return null;
}

/**
 * Compare two cell values with sensible, type-aware semantics:
 * numbers numerically, dates by time, everything else as a
 * case-insensitive, numeric-aware string compare ("Item 2" < "Item 10").
 * Nullish/empty values are treated as the lowest value.
 */
export function compareValues(a: CellValue, b: CellValue): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (typeof a === "boolean" && typeof b === "boolean") {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }
  const sa = a == null ? "" : String(a);
  const sb = b == null ? "" : String(b);
  return sa.localeCompare(sb, undefined, { numeric: true, sensitivity: "base" });
}

/**
 * Return a new, stably-sorted array. A `null` direction returns an
 * unmodified copy (original order preserved).
 */
export function sortRows<T>(
  rows: T[],
  accessor: (row: T) => CellValue,
  direction: SortDirection,
): T[] {
  if (!direction) return [...rows];
  const factor = direction === "asc" ? 1 : -1;
  // Array.prototype.sort is stable (ES2019+), so equal rows keep their order.
  return [...rows].sort(
    (ra, rb) => factor * compareValues(accessor(ra), accessor(rb)),
  );
}

/** Does any of a row's searchable values contain `query` (case-insensitive)? */
export function matchesQuery(values: CellValue[], query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return values.some(
    (value) => value != null && String(value).toLowerCase().includes(q),
  );
}

/**
 * Filter rows by a free-text query across each row's searchable values.
 * An empty/whitespace query returns the input untouched.
 */
export function filterRows<T>(
  rows: T[],
  query: string,
  getSearchableValues: (row: T) => CellValue[],
): T[] {
  if (!query.trim()) return rows;
  return rows.filter((row) => matchesQuery(getSearchableValues(row), query));
}

/**
 * Apply per-column exact-match filters. Entries whose value is empty or the
 * sentinel `"all"` are ignored; remaining filters are combined with AND.
 */
export function applyColumnFilters<T>(
  rows: T[],
  filters: Record<string, string>,
  accessors: Record<string, (row: T) => CellValue>,
): T[] {
  const active = Object.entries(filters).filter(
    ([, value]) => value && value !== "all",
  );
  if (active.length === 0) return rows;
  return rows.filter((row) =>
    active.every(([key, value]) => {
      const accessor = accessors[key];
      if (!accessor) return true;
      return String(accessor(row) ?? "") === value;
    }),
  );
}

/** Distinct, sorted string values for a column — used to build filter menus. */
export function distinctValues<T>(
  rows: T[],
  accessor: (row: T) => CellValue,
): string[] {
  const set = new Set<string>();
  for (const row of rows) {
    const value = accessor(row);
    if (value != null && value !== "") set.add(String(value));
  }
  return Array.from(set).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
}

/** Map an internal sort direction to the `aria-sort` attribute value. */
export function ariaSortValue(
  isActive: boolean,
  direction: SortDirection,
): "ascending" | "descending" | "none" {
  if (!isActive || !direction) return "none";
  return direction === "asc" ? "ascending" : "descending";
}

/**
 * Get the total number of pages for a dataset.
 * Returns 0 when pageSize is 0 or negative (show all mode).
 */
export function getTotalPages(totalItems: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.max(1, Math.ceil(totalItems / pageSize));
}

/**
 * Return a slice of rows for the given page.
 * Returns all rows when pageSize is 0 or negative.
 */
export function getPaginatedSlice<T>(rows: T[], page: number, pageSize: number): T[] {
  if (pageSize <= 0) return rows;
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
