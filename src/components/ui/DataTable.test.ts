import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { DataTable, type DataTableColumn } from "./DataTable";
import {
  applyColumnFilters,
  ariaSortValue,
  compareValues,
  cycleSortDirection,
  distinctValues,
  filterRows,
  getPaginatedSlice,
  getTotalPages,
  sortRows,
} from "./dataTable.utils";

interface Row {
  name: string;
  amount: number;
  status: string;
}

const rows: Row[] = [
  { name: "Item 10", amount: 250, status: "Pending" },
  { name: "Item 2", amount: 1000, status: "Completed" },
  { name: "item 1", amount: 50, status: "Completed" },
  { name: "Item 3", amount: 50, status: "Failed" },
];

test("cycleSortDirection cycles none → asc → desc → none", () => {
  assert.equal(cycleSortDirection(null), "asc");
  assert.equal(cycleSortDirection("asc"), "desc");
  assert.equal(cycleSortDirection("desc"), null);
});

test("compareValues sorts numbers numerically and strings naturally", () => {
  assert.ok(compareValues(2, 10) < 0);
  // "Item 2" should come before "Item 10" with numeric-aware compare
  assert.ok(compareValues("Item 2", "Item 10") < 0);
  // case-insensitive
  assert.equal(compareValues("item", "ITEM"), 0);
  // nullish treated as lowest
  assert.ok(compareValues(null, "a") < 0);
});

test("sortRows ascending and descending by a numeric accessor", () => {
  const asc = sortRows(rows, (r) => r.amount, "asc").map((r) => r.amount);
  assert.deepEqual(asc, [50, 50, 250, 1000]);

  const desc = sortRows(rows, (r) => r.amount, "desc").map((r) => r.amount);
  assert.deepEqual(desc, [1000, 250, 50, 50]);
});

test("sortRows with null direction returns an unmodified copy", () => {
  const result = sortRows(rows, (r) => r.amount, null);
  assert.notEqual(result, rows); // new array
  assert.deepEqual(result, rows); // same order
});

test("sortRows is stable for equal keys", () => {
  // Two rows share amount 50: "item 1" (index 2) then "Item 3" (index 3).
  const asc = sortRows(rows, (r) => r.amount, "asc")
    .filter((r) => r.amount === 50)
    .map((r) => r.name);
  assert.deepEqual(asc, ["item 1", "Item 3"]);
});

test("filterRows matches case-insensitively across values and passes through empty query", () => {
  const all = filterRows(rows, "", (r) => [r.name, r.amount, r.status]);
  assert.equal(all.length, 4);

  const completed = filterRows(rows, "complete", (r) => [r.name, r.status]);
  assert.equal(completed.length, 2);

  const byAmount = filterRows(rows, "1000", (r) => [r.name, r.amount]);
  assert.deepEqual(byAmount.map((r) => r.name), ["Item 2"]);
});

test("applyColumnFilters AND-combines active filters and ignores 'all'/empty", () => {
  const accessors = { status: (r: Row) => r.status };

  assert.equal(
    applyColumnFilters(rows, { status: "all" }, accessors).length,
    4,
  );
  assert.equal(applyColumnFilters(rows, {}, accessors).length, 4);

  const completed = applyColumnFilters(rows, { status: "Completed" }, accessors);
  assert.deepEqual(completed.map((r) => r.name), ["Item 2", "item 1"]);
});

test("distinctValues returns sorted unique strings", () => {
  assert.deepEqual(distinctValues(rows, (r) => r.status), [
    "Completed",
    "Failed",
    "Pending",
  ]);
});

test("ariaSortValue reflects active column + direction", () => {
  assert.equal(ariaSortValue(true, "asc"), "ascending");
  assert.equal(ariaSortValue(true, "desc"), "descending");
  assert.equal(ariaSortValue(false, "asc"), "none");
  assert.equal(ariaSortValue(true, null), "none");
});

test("getTotalPages returns correct page count", () => {
  assert.equal(getTotalPages(0, 20), 1);
  assert.equal(getTotalPages(20, 20), 1);
  assert.equal(getTotalPages(21, 20), 2);
  assert.equal(getTotalPages(40, 20), 2);
  assert.equal(getTotalPages(41, 20), 3);
});

test("getTotalPages returns 0 for pageSize 0 or negative (show all mode)", () => {
  assert.equal(getTotalPages(100, 0), 0);
  assert.equal(getTotalPages(100, -1), 0);
});

test("getPaginatedSlice splits data correctly across pages", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.deepEqual(getPaginatedSlice(items, 1, 3), [1, 2, 3]);
  assert.deepEqual(getPaginatedSlice(items, 2, 3), [4, 5, 6]);
  assert.deepEqual(getPaginatedSlice(items, 3, 3), [7, 8, 9]);
  assert.deepEqual(getPaginatedSlice(items, 4, 3), [10]);
});

test("getPaginatedSlice returns all rows when pageSize is 0", () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(getPaginatedSlice(items, 1, 0), items);
  assert.deepEqual(getPaginatedSlice(items, 5, 0), items);
});

test("getPaginatedSlice handles empty data", () => {
  assert.deepEqual(getPaginatedSlice([], 1, 20), []);
  assert.deepEqual(getPaginatedSlice([], 1, 0), []);
});

test("getPaginatedSlice handles out-of-range page gracefully", () => {
  const items = [1, 2, 3, 4, 5];
  assert.deepEqual(getPaginatedSlice(items, 10, 3), []);
});

test("interactive rows expose keyboard semantics", () => {
  type TestRow = { id: string; name: string };
  const columns: DataTableColumn<TestRow>[] = [
    {
      key: "name",
      header: "Name",
      accessor: (row) => row.name,
    },
  ];

  const markup = renderToStaticMarkup(
    React.createElement(DataTable<TestRow>, {
      data: [{ id: "1", name: "Alpha" }],
      columns,
      rowKey: (row) => row.id,
      onRowClick: () => undefined,
      pageSize: 10,
      searchable: false,
    }),
  );

  assert.match(markup, /role="button"/);
  assert.match(markup, /tabindex="0"/);
});
