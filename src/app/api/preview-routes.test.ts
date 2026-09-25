import assert from "node:assert/strict";
import test from "node:test";

import React from "react";
import {
  parseTransactionPreviewSearchParams,
  parseWidgetPreviewSearchParams,
} from "@/lib/preview-route-query";

const TRANSACTION_PREVIEW_URL = "https://neurowealth.test/api/transaction-preview";
const WIDGET_PREVIEW_URL = "https://neurowealth.test/api/widget-preview";

type TransactionPreviewRoute = typeof import("./transaction-preview/route");
type WidgetPreviewRoute = typeof import("./widget-preview/route");

async function loadTransactionPreviewRoute() {
  const route = await import("./transaction-preview/route");
  const compatRoute = route as TransactionPreviewRoute & {
    default?: TransactionPreviewRoute;
  };
  return compatRoute.default ?? route;
}

async function loadWidgetPreviewRoute() {
  const route = await import("./widget-preview/route");
  const compatRoute = route as WidgetPreviewRoute & {
    default?: WidgetPreviewRoute;
  };
  return compatRoute.default ?? route;
}

function installReactForJsxRuntime() {
  // Next compiles route JSX automatically; the Node smoke test needs React on
  // globalThis when importing the TSX route modules directly through tsx.
  Object.assign(globalThis, { React });
}

test("transaction preview route parses supported query parameters", async () => {
  const params = new URLSearchParams({
    theme: "dark",
    kind: "withdrawal",
    preview: "failure",
  });

  assert.deepEqual(parseTransactionPreviewSearchParams(params), {
    theme: "dark",
    kind: "withdrawal",
    preview: "failure",
  });
});

test("transaction preview route falls back for invalid query parameters", async () => {
  const params = new URLSearchParams({
    theme: "sepia",
    kind: "transfer",
    preview: "receipt",
  });

  assert.deepEqual(parseTransactionPreviewSearchParams(params), {
    theme: "light",
    kind: "deposit",
    preview: "interactive",
  });
});

test("transaction preview route returns an OG image response for valid queries", async () => {
  installReactForJsxRuntime();
  const route = await loadTransactionPreviewRoute();

  const response = await route.GET(
    new Request(
      `${TRANSACTION_PREVIEW_URL}?theme=dark&kind=withdrawal&preview=confirm`,
    ),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
});

test("widget preview route parses supported query parameters", async () => {
  const params = new URLSearchParams({ theme: "dark" });

  assert.deepEqual(parseWidgetPreviewSearchParams(params), {
    theme: "dark",
  });
});

test("widget preview route falls back for invalid query parameters", async () => {
  const params = new URLSearchParams({ theme: "high-contrast" });

  assert.deepEqual(parseWidgetPreviewSearchParams(params), {
    theme: "light",
  });
});

test("widget preview route returns an OG image response for invalid query fallbacks", async () => {
  installReactForJsxRuntime();
  const route = await loadWidgetPreviewRoute();

  const response = await route.GET(
    new Request(`${WIDGET_PREVIEW_URL}?theme=high-contrast`),
  );

  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^image\/png/);
});
