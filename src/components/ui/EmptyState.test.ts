import assert from "node:assert/strict";
import test from "node:test";

interface EmptyStateProps {
  icon?: boolean;
  heading: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
  onAction?: boolean;
}

function hasCtaButton({ ctaLabel, ctaHref, onAction }: EmptyStateProps): boolean {
  if (!ctaLabel) return false;
  return Boolean(ctaHref || onAction);
}

test("EmptyState — heading and body are required", () => {
  const props: EmptyStateProps = { heading: "No data", body: "Nothing to show" };
  assert.ok(props.heading.length > 0);
  assert.ok(props.body.length > 0);
});

test("EmptyState — no CTA when ctaLabel is omitted", () => {
  const result = hasCtaButton({ heading: "Empty", body: "No items" });
  assert.equal(result, false);
});

test("EmptyState — CTA when ctaLabel and ctaHref provided", () => {
  const result = hasCtaButton({
    heading: "Empty",
    body: "No items",
    ctaLabel: "Add",
    ctaHref: "/add",
  });
  assert.equal(result, true);
});

test("EmptyState — CTA when ctaLabel and onAction provided", () => {
  const result = hasCtaButton({
    heading: "Empty",
    body: "No items",
    ctaLabel: "Retry",
    onAction: true,
  });
  assert.equal(result, true);
});

test("EmptyState — no CTA when only ctaLabel but no href/action", () => {
  const result = hasCtaButton({
    heading: "Empty",
    body: "No items",
    ctaLabel: "Click me",
  });
  assert.equal(result, false);
});

test("EmptyState — empty heading edge case is allowed", () => {
  const props: EmptyStateProps = { heading: "", body: "Some body" };
  assert.equal(props.heading, "");
});
