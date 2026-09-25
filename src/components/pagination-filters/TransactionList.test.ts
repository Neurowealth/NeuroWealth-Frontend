import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import TransactionList from "./TransactionList";

test("TransactionList renders type, amount, and status columns", () => {
  const markup = renderToStaticMarkup(React.createElement(TransactionList));

  assert.match(markup, />Type</);
  assert.match(markup, />Amount</);
  assert.match(markup, />Status</);
  assert.match(markup, /transfer|deposit|withdrawal|swap/);
  assert.match(markup, /(?:ETH|USDC|BTC|SOL)/);
  assert.match(markup, /completed|pending|failed|cancelled/);
  assert.match(markup, /caption=|Transaction history, 87 results/);

  const source = readFileSync(new URL("./TransactionList.tsx", import.meta.url), "utf8");
  assert.match(source, /emptyMessage="No transactions match the selected filters\."/);
});

test("TransactionList status/type pills use the shared Badge component", () => {
  const source = readFileSync(new URL("./TransactionList.tsx", import.meta.url), "utf8");
  assert.match(source, /import \{ Badge \} from "@\/components\/ui\/Badge";/);
  assert.match(source, /<Badge variant="default" size="sm">\s*\{\s*tx\.type\s*\}\s*<\/Badge>/);
  assert.match(
    source,
    /<Badge variant=\{STATUS_VARIANT\[tx\.status\] \?\? "default"\} size="sm">\s*\{\s*tx\.status\s*\}\s*<\/Badge>/,
  );
  assert.match(source, /completed: "success"/);
  assert.match(source, /pending: "warning"/);
  assert.match(source, /failed: "error"/);
  assert.doesNotMatch(source, /STATUS_COLORS/);
  assert.doesNotMatch(source, /rgba\(16,185,129/);
  assert.doesNotMatch(source, /\#10b981/);
});