"use client";

import React, {
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Columns3,
  Search,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  applyColumnFilters,
  ariaSortValue,
  type CellValue,
  cycleSortDirection,
  distinctValues,
  filterRows,
  getPaginatedSlice,
  getTotalPages,
  type SortDirection,
  sortRows,
} from "./dataTable.utils";

export interface DataTableColumn<T> {
  /** Stable, unique column id. */
  key: string;
  /** Header label. */
  header: string;
  /** Extract the raw value used for sort / search / filter. */
  accessor: (row: T) => CellValue;
  /** Custom cell renderer; falls back to the accessor value. */
  render?: (row: T) => ReactNode;
  /** Enable click-to-sort on this column. */
  sortable?: boolean;
  /** Build a per-column dropdown filter from distinct values. */
  filterable?: boolean;
  /** Horizontal alignment of header + cells. */
  align?: "left" | "center" | "right";
  /** Allow the user to hide this column. Default `true`. */
  hideable?: boolean;
  /** Start hidden until toggled on in the column menu. */
  defaultHidden?: boolean;
  /** Fixed column width, e.g. `"120px"`. */
  width?: string;
  /** Label used in the mobile card layout (defaults to `header`). */
  mobileLabel?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  /** Stable row identity. */
  rowKey: (row: T) => string;
  /** Show the global search box. Default `true`. */
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Zebra striping (optional per spec). Default `false`. */
  striped?: boolean;
  /** Sticky header on desktop. Default `true`. */
  stickyHeader?: boolean;
  /** Initial sort state. */
  initialSort?: { key: string; direction: Exclude<SortDirection, null> };
  /** Accessible caption / description. */
  caption?: string;
  emptyMessage?: string;
  /** Optional row click handler (also makes rows keyboard-activatable with Enter/Space). */
  onRowClick?: (row: T) => void;
  className?: string;
  /** Rows per page for client-side pagination. 0 or undefined shows all rows. */
  pageSize?: number;
}

const alignText = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-900";

/**
 * Advanced, accessible data table (Issue #462).
 *
 * - Sortable columns with `aria-sort` (none → asc → desc → none).
 * - Global search + per-column dropdown filters.
 * - Keyboard-accessible column-visibility menu with visible focus rings.
 * - Sticky header on desktop; responsive card layout on mobile (<768px).
 * - All interaction is local state over the provided dataset.
 */
export function DataTable<T extends object>({
  data,
  columns,
  rowKey,
  searchable = true,
  searchPlaceholder = "Search…",
  striped = false,
  stickyHeader = true,
  initialSort,
  caption,
  emptyMessage = "No results found.",
  onRowClick,
  className,
  pageSize,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ key: string; direction: SortDirection }>(
    initialSort ?? { key: "", direction: null },
  );
  const [query, setQuery] = useState("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [hidden, setHidden] = useState<Set<string>>(
    () => new Set(columns.filter((c) => c.defaultHidden).map((c) => c.key)),
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const captionId = useId();

  // Close the column menu on outside click.
  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const accessorsByKey = useMemo(
    () => Object.fromEntries(columns.map((c) => [c.key, c.accessor])),
    [columns],
  );

  const filterOptions = useMemo(() => {
    const options: Record<string, string[]> = {};
    for (const column of columns) {
      if (column.filterable) {
        options[column.key] = distinctValues(data, column.accessor);
      }
    }
    return options;
  }, [columns, data]);

  const visibleColumns = useMemo(
    () => columns.filter((c) => !hidden.has(c.key)),
    [columns, hidden],
  );

  const rows = useMemo(() => {
    const searched = searchable
      ? filterRows(data, query, (row) => columns.map((c) => c.accessor(row)))
      : data;
    const filtered = applyColumnFilters(searched, columnFilters, accessorsByKey);
    const activeColumn = columns.find((c) => c.key === sort.key);
    return activeColumn
      ? sortRows(filtered, activeColumn.accessor, sort.direction)
      : filtered;
  }, [data, columns, query, columnFilters, accessorsByKey, sort, searchable]);

  const totalPages = useMemo(
    () => getTotalPages(rows.length, pageSize ?? 0),
    [rows, pageSize],
  );

  const pagedRows = useMemo(
    () => getPaginatedSlice(rows, currentPage, pageSize ?? 0),
    [rows, currentPage, pageSize],
  );

  const safePage = Math.min(currentPage, totalPages || 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [data, query, columnFilters]);

  const toggleSort = (key: string) =>
    setSort((prev) => {
      if (prev.key !== key) return { key, direction: "asc" };
      const next = cycleSortDirection(prev.direction);
      return next ? { key, direction: next } : { key: "", direction: null };
    });

  const toggleColumn = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const hideableColumns = columns.filter((c) => c.hideable !== false);
  const activeFilterCount = Object.values(columnFilters).filter(
    (v) => v && v !== "all",
  ).length;

  const renderCell = (column: DataTableColumn<T>, row: T): ReactNode => {
    if (column.render) return column.render(row);
    const value = column.accessor(row);
    return value == null || value === "" ? "—" : String(value);
  };

  const handleRowKeyDown = (event: KeyboardEvent<HTMLElement>, row: T) => {
    if (!onRowClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row);
    }
  };

  const SortIcon = ({ column }: { column: DataTableColumn<T> }) => {
    const active = sort.key === column.key && sort.direction;
    if (active === "asc") return <ArrowUp size={14} className="text-sky-500" />;
    if (active === "desc") return <ArrowDown size={14} className="text-sky-500" />;
    return (
      <ChevronsUpDown
        size={14}
        className="text-slate-400 opacity-0 transition-opacity group-hover:opacity-100"
      />
    );
  };

  return (
    <div
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/40 sm:p-4",
        className,
      )}
    >
      {/* ── Toolbar ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchable && (
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                aria-label="Search table"
                className={cn(
                  "h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-8 text-sm text-slate-800 placeholder:text-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-100",
                  FOCUS_RING,
                )}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200",
                    FOCUS_RING,
                  )}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}

          {/* Per-column filters */}
          {columns
            .filter((c) => c.filterable && !hidden.has(c.key))
            .map((column) => (
              <label key={column.key} className="flex items-center gap-1.5">
                <span className="sr-only">Filter by {column.header}</span>
                <select
                  value={columnFilters[column.key] ?? "all"}
                  onChange={(e) =>
                    setColumnFilters((prev) => ({
                      ...prev,
                      [column.key]: e.target.value,
                    }))
                  }
                  className={cn(
                    "h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-700 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200",
                    FOCUS_RING,
                  )}
                >
                  <option value="all">All {column.header}</option>
                  {(filterOptions[column.key] ?? []).map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            ))}
        </div>

        {/* Column visibility menu */}
        {hideableColumns.length > 0 && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-white/5",
                FOCUS_RING,
              )}
            >
              <Columns3 size={15} />
              <span className="hidden sm:inline">Columns</span>
              {activeFilterCount > 0 && (
                <span className="rounded-full bg-sky-500 px-1.5 text-xs font-semibold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {menuOpen && (
              <div
                id={menuId}
                role="menu"
                aria-label="Toggle columns"
                onKeyDown={(e) => {
                  if (e.key === "Escape") setMenuOpen(false);
                }}
                className="absolute right-0 z-20 mt-2 w-52 rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-slate-800"
              >
                <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Visible columns
                </p>
                {hideableColumns.map((column) => (
                  <label
                    key={column.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      role="menuitemcheckbox"
                      checked={!hidden.has(column.key)}
                      aria-checked={!hidden.has(column.key)}
                      onChange={() => toggleColumn(column.key)}
                      className={cn(
                        "h-4 w-4 rounded border-slate-300 text-sky-500 accent-sky-500 dark:border-white/20",
                        FOCUS_RING,
                      )}
                    />
                    {column.header}
                  </label>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Desktop table ────────────────────────────────────────── */}
      <div className="hidden overflow-auto rounded-lg md:block" style={{ maxHeight: 520 }}>
        <table className="w-full border-collapse text-sm" aria-describedby={caption ? captionId : undefined}>
          {caption && (
            <caption id={captionId} className="sr-only">
              {caption}
            </caption>
          )}
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10">
              {visibleColumns.map((column) => {
                const isActive = sort.key === column.key;
                return (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={ariaSortValue(isActive, isActive ? sort.direction : null)}
                    style={{ width: column.width }}
                    className={cn(
                      "h-11 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400",
                      stickyHeader &&
                        "sticky top-0 z-10 bg-slate-50/95 backdrop-blur dark:bg-slate-900/95",
                      alignText[column.align ?? "left"],
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.key)}
                        className={cn(
                          "group -mx-1 inline-flex items-center gap-1.5 rounded px-1 py-0.5 hover:text-slate-800 dark:hover:text-slate-100",
                          column.align === "right" && "flex-row-reverse",
                          FOCUS_RING,
                        )}
                      >
                        <span>{column.header}</span>
                        <SortIcon column={column} />
                      </button>
                    ) : (
                      <span>{column.header}</span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {pagedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumns.length}
                  className="h-32 text-center text-slate-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pagedRows.map((row) => (
                <tr
                  key={rowKey(row)}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
                  role={onRowClick ? "button" : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  className={cn(
                    "transition-colors",
                    striped && "even:bg-slate-50/70 dark:even:bg-white/[0.02]",
                    onRowClick &&
                      "cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.04]",
                  )}
                >
                  {visibleColumns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        "h-14 px-4 text-slate-700 dark:text-slate-200",
                        alignText[column.align ?? "left"],
                      )}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card layout ───────────────────────────────────── */}
      <ul className="flex flex-col gap-2.5 md:hidden" aria-label={caption ?? "Table rows"}>
        {pagedRows.length === 0 ? (
          <li className="rounded-lg border border-dashed border-slate-200 py-10 text-center text-sm text-slate-400 dark:border-white/10">
            {emptyMessage}
          </li>
        ) : (
          pagedRows.map((row) => (
            <li
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (event) => handleRowKeyDown(event, row) : undefined}
              role={onRowClick ? "button" : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              className={cn(
                "rounded-lg border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-slate-900/60",
                onRowClick && "cursor-pointer active:bg-slate-50 dark:active:bg-white/5",
              )}
            >
              <dl className="flex flex-col gap-1.5">
                {visibleColumns.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center justify-between gap-3"
                  >
                    <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      {column.mobileLabel ?? column.header}
                    </dt>
                    <dd className="text-right text-sm font-medium text-slate-700 dark:text-slate-200">
                      {renderCell(column, row)}
                    </dd>
                  </div>
                ))}
              </dl>
            </li>
          ))
        )}
      </ul>

      {/* Pagination controls */}
      {pageSize && pageSize > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between gap-4 px-1">
          <p className="text-xs text-slate-400">
            {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, rows.length)}
            {" of "}
            <span className="text-slate-300">{rows.length}</span>
          </p>
          <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safePage <= 1}
              aria-label="Previous page"
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-lg border text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 dark:hover:text-white dark:hover:border-white/20",
                FOCUS_RING,
              )}
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCurrentPage(n)}
                aria-label={`Page ${n}`}
                aria-current={n === safePage ? "page" : undefined}
                className={cn(
                  "inline-flex items-center justify-center h-8 w-8 rounded-lg text-sm transition-colors",
                  n === safePage
                    ? "bg-sky-500 text-white font-semibold"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-400 dark:hover:text-white dark:hover:border-white/20",
                  FOCUS_RING,
                )}
              >
                {n}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage >= totalPages}
              aria-label="Next page"
              className={cn(
                "inline-flex items-center justify-center h-8 w-8 rounded-lg border text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors",
                "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900 dark:hover:text-white dark:hover:border-white/20",
                FOCUS_RING,
              )}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Result count for screen readers + footer */}
      <p
        className="px-1 text-xs text-slate-400"
        role="status"
        aria-live="polite"
      >
        {pageSize && pageSize > 0 && rows.length > 0
          ? `${(safePage - 1) * pageSize + 1}–${Math.min(safePage * pageSize, rows.length)} of ${rows.length}${rows.length === 1 ? " row" : " rows"}`
          : `Showing ${rows.length} of ${data.length}${data.length === 1 ? " row" : " rows"}`
        }
      </p>
    </div>
  );
}

export default DataTable;
