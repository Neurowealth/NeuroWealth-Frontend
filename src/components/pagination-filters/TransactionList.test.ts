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