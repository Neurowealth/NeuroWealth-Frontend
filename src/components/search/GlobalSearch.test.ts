import assert from "node:assert/strict";
import test from "node:test";

import {
  computeNextIndex,
  createLatestRequestTracker,
  resolveLiveRegionMessage,
} from "@/components/search/GlobalSearch";
import {
  GroupedSearchResults,
  hasAnySearchResults,
  searchMockIndex,
} from "@/lib/mock-search-index";
import { getSearchDataProvider, setSearchDataProvider } from "@/lib/search-service";

// ── computeNextIndex ─────────────────────────────────────────────────────────

test("computeNextIndex moves forward by 1", () => {
  assert.equal(computeNextIndex(0, 1, 5), 1);
  assert.equal(computeNextIndex(3, 1, 5), 4);
});

test("computeNextIndex moves backward by 1", () => {
  assert.equal(computeNextIndex(4, -1, 5), 3);
  assert.equal(computeNextIndex(1, -1, 5), 0);
});

test("computeNextIndex wraps from last to first", () => {
  assert.equal(computeNextIndex(4, 1, 5), 0);
});

test("computeNextIndex wraps from first to last", () => {
  assert.equal(computeNextIndex(0, -1, 5), 4);
});

test("computeNextIndex starts at 0 when current is -1", () => {
  assert.equal(computeNextIndex(-1, 1, 5), 0);
  assert.equal(computeNextIndex(-1, -1, 5), 0);
});

test("computeNextIndex returns -1 when total is 0", () => {
  assert.equal(computeNextIndex(-1, 1, 0), -1);
  assert.equal(computeNextIndex(0, 1, 0), -1);
});

test("computeNextIndex clamps out-of-range current to 0", () => {
  assert.equal(computeNextIndex(99, 1, 5), 0);
});

// ── createLatestRequestTracker (race safety, #365) ───────────────────────────

test("tracker: a response for the latest request is applied", () => {
  const tracker = createLatestRequestTracker();
  const id = tracker.start();
  assert.equal(tracker.isStale(id), false);
});

test("tracker: rapid typing supersedes the earlier in-flight request", () => {
  const tracker = createLatestRequestTracker();
  // User types, fires a search, then types again before the first resolves.
  const first = tracker.start();
  const second = tracker.start();

  // Slow first response arrives after the second query started → dropped.
  assert.equal(tracker.isStale(first), true);
  // Newer query's response is still applied.
  assert.equal(tracker.isStale(second), false);
});

test("tracker: out-of-order resolution never lets a stale result win", () => {
  const tracker = createLatestRequestTracker();
  const first = tracker.start();
  const second = tracker.start();

  // Even if the second resolves first and the first resolves last,
  // the first remains stale and cannot overwrite the newer results.
  assert.equal(tracker.isStale(second), false);
  assert.equal(tracker.isStale(first), true);
});

test("tracker: invalidate() drops the in-flight request (clear / navigate / unmount)", () => {
  const tracker = createLatestRequestTracker();
  const id = tracker.start();
  tracker.invalidate();

  // A late response after clearing the query can no longer repopulate.
  assert.equal(tracker.isStale(id), true);
});

test("tracker: a fresh request after invalidate is honoured again", () => {
  const tracker = createLatestRequestTracker();
  tracker.start();
  tracker.invalidate();

  const next = tracker.start();
  assert.equal(tracker.isStale(next), false);
});

test("tracker: ids are strictly increasing across starts and invalidations", () => {
  const tracker = createLatestRequestTracker();
  const a = tracker.start();
  const b = tracker.start();
  tracker.invalidate();
  const c = tracker.start();

  assert.ok(b > a);
  assert.ok(c > b);
});

// ── hasAnySearchResults ──────────────────────────────────────────────────────

test("hasAnySearchResults returns false for empty results", () => {
  const empty: GroupedSearchResults = { Pages: [], Actions: [], Records: [] };
  assert.equal(hasAnySearchResults(empty), false);
});

test("hasAnySearchResults returns true when any group has items", () => {
  const withPages: GroupedSearchResults = {
    Pages: [
      {
        id: "p1",
        group: "Pages",
        title: "Test",
        description: "",
        href: "/test",
      },
    ],
    Actions: [],
    Records: [],
  };
  assert.equal(hasAnySearchResults(withPages), true);
});

test("hasAnySearchResults returns true when Actions has items", () => {
  const withActions: GroupedSearchResults = {
    Pages: [],
    Actions: [
      {
        id: "a1",
        group: "Actions",
        title: "Test",
        description: "",
        href: "/test",
      },
    ],
    Records: [],
  };
  assert.equal(hasAnySearchResults(withActions), true);
});

test("hasAnySearchResults returns true when Records has items", () => {
  const withRecords: GroupedSearchResults = {
    Pages: [],
    Actions: [],
    Records: [
      {
        id: "r1",
        group: "Records",
        title: "Test",
        description: "",
        href: "/test",
      },
    ],
  };
  assert.equal(hasAnySearchResults(withRecords), true);
});

// ── searchMockIndex ──────────────────────────────────────────────────────────

test("searchMockIndex returns empty results for empty query", async () => {
  const results = await searchMockIndex("");
  assert.equal(hasAnySearchResults(results), false);
});

test("searchMockIndex returns empty results for whitespace-only query", async () => {
  const results = await searchMockIndex("   ");
  assert.equal(hasAnySearchResults(results), false);
});

test("searchMockIndex matches by title (case-insensitive)", async () => {
  const results = await searchMockIndex("dashboard");
  assert.ok(results.Pages.some((p) => p.title === "Dashboard"));
});

test("searchMockIndex matches by description", async () => {
  const results = await searchMockIndex("portfolio");
  assert.ok(results.Pages.some((p) => p.title === "Dashboard"));
});

test("searchMockIndex matches by keyword", async () => {
  const results = await searchMockIndex("deposit");
  assert.ok(results.Actions.some((a) => a.id === "action-start-deposit"));
  assert.ok(results.Records.some((r) => r.id === "record-tx-7f1"));
});

test("searchMockIndex returns grouped results", async () => {
  // "tx" appears in Records (TX-7F1C, TX-912A) and action keywords
  const results = await searchMockIndex("tx");
  assert.ok(results.Records.length >= 2);
  assert.ok(results.Actions.length >= 0);
  assert.ok(results.Pages.length >= 0);
});

test("searchMockIndex throws for query 'error'", async () => {
  await assert.rejects(
    () => searchMockIndex("error"),
    /Mock search failed/,
  );
});

test("searchMockIndex returns empty for no match", async () => {
  const results = await searchMockIndex("xyznonexistent");
  assert.equal(hasAnySearchResults(results), false);
});

test("searchMockIndex returns empty for 'error' in Pages group", async () => {
  // It throws, so no results
  await assert.rejects(() => searchMockIndex("error"));
});

// ── Search group counts ───────────────────────────────────────────────────────

test("searchMockIndex 'home' returns the Home page", async () => {
  const results = await searchMockIndex("home");
  assert.equal(results.Pages.length, 1);
  assert.equal(results.Pages[0].id, "page-home");
});

test("searchMockIndex 'usdc' returns deposit action and TX record", async () => {
  const results = await searchMockIndex("usdc");
  assert.ok(results.Actions.some((a) => a.id === "action-start-deposit"));
  assert.ok(results.Records.some((r) => r.id === "record-tx-7f1"));
});

// ── resolveLiveRegionMessage ─────────────────────────────────────────────────

test("live region: empty query returns no message", () => {
  assert.equal(resolveLiveRegionMessage(false, null, false, false, "", 0), "");
});

test("live region: loading state returns no message to avoid noise", () => {
  assert.equal(resolveLiveRegionMessage(true, null, true, false, "test", 0), "");
});

test("live region: error state returns error message", () => {
  assert.equal(resolveLiveRegionMessage(false, "Network error", true, false, "test", 0), "Search error: Network error");
});

test("live region: committed query with no results returns empty message", () => {
  assert.equal(resolveLiveRegionMessage(false, null, true, false, "unknown", 0), "No results found for unknown");
});

test("live region: results returns count and navigation instruction", () => {
  assert.equal(resolveLiveRegionMessage(false, null, true, true, "test", 1), "1 search result available. Use arrow keys to navigate.");
  assert.equal(resolveLiveRegionMessage(false, null, true, true, "test", 5), "5 search results available. Use arrow keys to navigate.");
});

// ── SearchDataProvider Mock ──────────────────────────────────────────────────

test("provider: mocked provider intercepts search queries", async () => {
  const original = getSearchDataProvider();
  
  const customProvider = {
    search: async (query: string) => {
      if (query === "mocked") {
        return { Pages: [], Actions: [], Records: [] };
      }
      throw new Error("Provider error");
    }
  };
  
  setSearchDataProvider(customProvider);
  
  const empty = await getSearchDataProvider().search("mocked");
  assert.equal(hasAnySearchResults(empty), false);
  
  await assert.rejects(
    () => getSearchDataProvider().search("error"),
    /Provider error/
  );
  
  setSearchDataProvider(original);
});
