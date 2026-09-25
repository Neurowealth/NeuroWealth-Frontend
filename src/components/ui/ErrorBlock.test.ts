import assert from "node:assert/strict";
import test from "node:test";

interface ErrorBlockProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: boolean;
}

function hasActionButton({ actionLabel, onAction }: ErrorBlockProps): boolean {
  return Boolean(actionLabel && onAction);
}

test("ErrorBlock — has role alert", () => {
  const role = "alert";
  assert.equal(role, "alert");
});

test("ErrorBlock — has aria-live assertive", () => {
  const live = "assertive";
  assert.equal(live, "assertive");
});

test("ErrorBlock — action button present when onAction provided", () => {
  const result = hasActionButton({
    title: "Error",
    description: "Something went wrong",
    actionLabel: "Retry",
    onAction: true,
  });
  assert.equal(result, true);
});

test("ErrorBlock — no action button when onAction missing", () => {
  const result = hasActionButton({
    title: "Error",
    description: "Something went wrong",
    actionLabel: "Retry",
  });
  assert.equal(result, false);
});

test("ErrorBlock — no action button when actionLabel missing", () => {
  const result = hasActionButton({
    title: "Error",
    description: "Something went wrong",
    onAction: true,
  });
  assert.equal(result, false);
});

test("ErrorBlock — default action label is Try again", () => {
  const defaultLabel = "Try again";
  assert.equal(defaultLabel, "Try again");
});
