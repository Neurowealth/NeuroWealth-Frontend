"use client";

import { useMemo, useState, type ReactNode } from "react";
import { ChevronDown, ChevronUp, Eye, EyeOff, Filter } from "lucide-react";

type SortDirection = "asc" | "desc";

export interface AdvancedTableColumn<T> {
  key: string;
  label: string;
  accessor: (row: T) => string | number;
  render?: (row: T) => ReactNode;
  mobileLabel?: string;
  sortable?: boolean;
  className?: string;
}

interface AdvancedTableProps<T extends { id: string }> {
  columns: AdvancedTableColumn<T>[];
  rows: T[];
  title: string;
  description: string;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterPlaceholder?: string;
  emptyState: ReactNode;
  zebra?: boolean;
}

function compareValues(left: string | number, right: string | number, direction: SortDirection) {
  const normalizedLeft = typeof left === "number" ? left : left.toString().toLowerCase();
  const normalizedRight = typeof right === "number" ? right : right.toString().toLowerCase();

  if (normalizedLeft < normalizedRight) {
    return direction === "asc" ? -1 : 1;
  }

  if (normalizedLeft > normalizedRight) {
    return direction === "asc" ? 1 : -1;
  }

  return 0;
}

export function AdvancedTable<T extends { id: string }>({
  columns,
  description,
  emptyState,
  filterPlaceholder = "Filter rows",
  filterValue,
  onFilterChange,
  rows,
  title,
  zebra = true,
}: AdvancedTableProps<T>) {
  const [sortKey, setSortKey] = useState(columns[0]?.key ?? "");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(() =>
    columns.map((column) => column.key),
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => visibleColumnKeys.includes(column.key)),
    [columns, visibleColumnKeys],
  );

  const sortedRows = useMemo(() => {
    const activeColumn = columns.find((column) => column.key === sortKey);

    if (!activeColumn) {
      return rows;
    }

    return [...rows].sort((left, right) =>
      compareValues(activeColumn.accessor(left), activeColumn.accessor(right), sortDirection),
    );
  }, [columns, rows, sortDirection, sortKey]);

  const toggleColumn = (columnKey: string) => {
    setVisibleColumnKeys((current) => {
      if (current.includes(columnKey)) {
        if (current.length === 1) {
          return current;
        }

        return current.filter((key) => key !== columnKey);
      }

      return [...current, columnKey];
    });
  };

  const updateSort = (column: AdvancedTableColumn<T>) => {
    if (column.sortable === false) {
      return;
    }

    if (sortKey === column.key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(column.key);
    setSortDirection("asc");
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
          <p className="max-w-2xl text-sm leading-6 text-slate-400">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex min-w-[240px] items-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-sm text-slate-300">
            <Filter className="h-4 w-4 text-slate-500" />
            <input
              className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-500"
              onChange={(event) => onFilterChange(event.target.value)}
              placeholder={filterPlaceholder}
              value={filterValue}
            />
          </label>

          <details className="group rounded-xl border border-slate-700/60 bg-slate-900/60">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm text-slate-200">
              <Eye className="h-4 w-4 text-slate-400" />
              Columns
            </summary>
            <div className="space-y-2 border-t border-slate-700/60 p-3">
              {columns.map((column) => {
                const visible = visibleColumnKeys.includes(column.key);

                return (
                  <label key={column.key} className="flex items-center justify-between gap-3 text-sm text-slate-300">
                    <span>{column.label}</span>
                    <button
                      aria-pressed={visible}
                      className="rounded-lg border border-slate-700/60 px-2 py-1 text-xs font-medium text-slate-200 transition hover:border-slate-500"
                      onClick={(event) => {
                        event.preventDefault();
                        toggleColumn(column.key);
                      }}
                      type="button"
                    >
                      {visible ? (
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          Visible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1">
                          <EyeOff className="h-3.5 w-3.5" />
                          Hidden
                        </span>
                      )}
                    </button>
                  </label>
                );
              })}
            </div>
          </details>
        </div>
      </div>

      {rows.length === 0 ? (
        emptyState
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-950/35 md:block">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-slate-950/85 backdrop-blur">
                <tr className="border-b border-slate-700/50 text-left">
                  {visibleColumns.map((column) => {
                    const active = sortKey === column.key;

                    return (
                      <th
                        className={`h-11 px-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 ${column.className ?? ""}`}
                        key={column.key}
                        scope="col"
                      >
                        <button
                          className="inline-flex items-center gap-2 text-left transition hover:text-slate-200"
                          onClick={() => updateSort(column)}
                          type="button"
                        >
                          <span>{column.label}</span>
                          {active ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )
                          ) : null}
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, rowIndex) => (
                  <tr
                    className={`h-[56px] border-b border-slate-800/80 last:border-b-0 ${
                      zebra && rowIndex % 2 === 1 ? "bg-slate-900/35" : ""
                    }`}
                    key={row.id}
                  >
                    {visibleColumns.map((column) => (
                      <td className={`px-4 py-3 text-sm text-slate-200 ${column.className ?? ""}`} key={column.key}>
                        {column.render ? column.render(row) : column.accessor(row)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 md:hidden">
            {sortedRows.map((row) => (
              <article key={row.id} className="rounded-2xl border border-slate-700/50 bg-slate-950/35 p-4">
                <div className="grid gap-3">
                  {visibleColumns.map((column) => (
                    <div key={column.key}>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {column.mobileLabel ?? column.label}
                      </p>
                      <div className="mt-1 text-sm text-slate-100">
                        {column.render ? column.render(row) : column.accessor(row)}
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
        <span className="rounded-full border border-slate-700/60 px-3 py-1">
          {rows.length} filtered rows
        </span>
        <span className="rounded-full border border-slate-700/60 px-3 py-1">
          Sticky header on desktop
        </span>
        <span className="rounded-full border border-slate-700/60 px-3 py-1">
          Responsive cards on mobile
        </span>
      </div>
    </div>
  );
}
