import assert from "node:assert/strict";
import { afterEach, describe, it, mock } from "node:test";
import React from "react";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import type { Notification } from "@/lib/mock-notifications";
import { NotificationItem } from "./NotificationItem";

setupDomGlobals();
Object.assign(globalThis, { React });

const base: Notification = {
  id: "n1",
  title: "Transaction Successful",
  message: "Your deposit of 500 USDC has been confirmed.",
  timestamp: new Date("2026-01-01T10:00:00Z").toISOString(),
  status: "success",
  isRead: false,
};

function renderInList(notification: Notification, onMarkAsRead = mock.fn()) {
  const utils = render(
    <div role="list" aria-label="Notification list">
      <NotificationItem notification={notification} onMarkAsRead={onMarkAsRead} />
    </div>,
  );
  return { ...utils, onMarkAsRead };
}

describe("NotificationItem accessibility semantics", () => {
  afterEach(cleanup);

  it("exposes an unread notification as a button whose name includes the title", () => {
    const { getByRole } = renderInList(base);
    const button = getByRole("button", { name: /Transaction Successful/ });
    assert.equal(button.tagName, "BUTTON");
    assert.equal(button.getAttribute("type"), "button");
    assert.equal(button.getAttribute("aria-label"), null);
  });

  it("keeps listitem semantics on a parent element, not on the button", () => {
    const { getByRole } = renderInList(base);
    const listitem = getByRole("listitem");
    const button = getByRole("button");
    assert.notEqual(listitem, button);
    assert.ok(listitem.contains(button));
    assert.ok(getByRole("list").contains(listitem));
  });

  it("marks the notification as read when the button is clicked (Enter/Space activate native buttons via click)", () => {
    const { getByRole, onMarkAsRead } = renderInList(base);
    fireEvent.click(getByRole("button"));
    assert.equal(onMarkAsRead.mock.callCount(), 1);
    assert.deepEqual(onMarkAsRead.mock.calls[0].arguments, ["n1"]);
  });

  it("does not render a mark-as-read button for an already-read notification", () => {
    const { queryByRole, getByRole } = renderInList({ ...base, isRead: true });
    assert.equal(queryByRole("button"), null);
    assert.ok(getByRole("listitem"));
  });

  it("does not mark as read when the action button is used", () => {
    const { getByRole, onMarkAsRead } = renderInList({
      ...base,
      action: { label: "View Transaction", href: "#" },
    });
    assert.equal(getByRole("button", { name: "View Transaction" }).tagName, "BUTTON");
    fireEvent.click(getByRole("button", { name: "View Transaction" }));
    assert.equal(onMarkAsRead.mock.callCount(), 0);
  });
});
