import assert from "node:assert/strict";
import test from "node:test";
import React, { createElement } from "react";
import "@/test-utils/jsdom-setup";
import { cleanup, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { SearchParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";
import { I18nProvider } from "@/contexts/I18nContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { TransactionFlow } from "./TransactionFlow";

Object.assign(globalThis, { React });

function renderTransactionFlow(initialParams = "theme=light&kind=deposit&preview=interactive") {
  const router = {
    push: () => {},
    replace: () => {},
    refresh: () => {},
    prefetch: () => {},
    back: () => {},
    forward: () => {},
  };
  const searchParams = new URLSearchParams(initialParams);

  return render(
    createElement(
      AppRouterContext.Provider,
      { value: router },
      createElement(
        SearchParamsContext.Provider,
        { value: searchParams },
        createElement(
          I18nProvider,
          null,
          createElement(SandboxProvider, null, createElement(TransactionFlow)),
        ),
      ),
    ),
  );
}

test("TransactionFlow segmented controls expose aria-pressed selection state and update via keyboard (#1175)", async (t) => {
  t.after(cleanup);
  const user = userEvent.setup();
  const view = renderTransactionFlow();

  // 1. Theme selector group
  const lightBtn = view.getByRole("button", { name: /Light/i });
  const darkBtn = view.getByRole("button", { name: /Dark/i });
  assert.equal(lightBtn.getAttribute("aria-pressed"), "true");
  assert.equal(darkBtn.getAttribute("aria-pressed"), "false");

  // Activate Dark mode with keyboard
  darkBtn.focus();
  await user.keyboard("{Enter}");
  assert.equal(darkBtn.getAttribute("aria-pressed"), "true");
  assert.equal(lightBtn.getAttribute("aria-pressed"), "false");

  // 2. Preview state selector group
  const liveFlowBtn = view.getByRole("button", { name: /Live flow/i });
  const confirmPreviewBtn = view.getByRole("button", { name: /^Confirm$/i });
  assert.equal(liveFlowBtn.getAttribute("aria-pressed"), "true");
  assert.equal(confirmPreviewBtn.getAttribute("aria-pressed"), "false");

  confirmPreviewBtn.focus();
  await user.keyboard(" ");
  assert.equal(confirmPreviewBtn.getAttribute("aria-pressed"), "true");
  assert.equal(liveFlowBtn.getAttribute("aria-pressed"), "false");

  // 3. Transaction kind selector group (Deposit vs Withdraw)
  const groups = view.getAllByRole("group");
  const kindGroup = groups.find((g) => within(g).queryByRole("button", { name: /^Deposit$/i }));
  assert.ok(kindGroup, "transaction kind group must have role=group");

  const depositBtn = within(kindGroup).getByRole("button", { name: /^Deposit$/i });
  const withdrawBtn = within(kindGroup).getByRole("button", { name: /^Withdraw$/i });
  assert.equal(depositBtn.getAttribute("aria-pressed"), "true");
  assert.equal(withdrawBtn.getAttribute("aria-pressed"), "false");

  withdrawBtn.focus();
  await user.keyboard("{Enter}");
  assert.equal(withdrawBtn.getAttribute("aria-pressed"), "true");
  assert.equal(depositBtn.getAttribute("aria-pressed"), "false");
});
