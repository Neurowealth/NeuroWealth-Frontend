import assert from "node:assert/strict";
import test from "node:test";

type InputVariant = "default" | "error" | "success";

interface InputProps {
  variant?: InputVariant;
  error?: string;
  label?: string;
  hint?: string;
  disabled?: boolean;
}

const inputVariants: Record<InputVariant, string> = {
  default: "border-slate-200 focus:border-brand-500",
  error: "border-accent-red focus:border-accent-red",
  success: "border-brand-500 focus:border-brand-500",
};

function resolveInputVariant(variant: InputVariant, error?: string): InputVariant {
  return error ? "error" : variant;
}

function deriveInputId(label?: string): string | undefined {
  return label ? label.toLowerCase().replace(/\s+/g, "-") : undefined;
}

function getHintText(error?: string, hint?: string): string | undefined {
  if (error) return error;
  return hint;
}

test("Input — error variant overrides default", () => {
  const resolved = resolveInputVariant("default", "This field is required");
  assert.equal(resolved, "error");
});

test("Input — no error preserves variant", () => {
  const resolved = resolveInputVariant("success");
  assert.equal(resolved, "success");
});

test("Input — error text takes precedence over hint", () => {
  const text = getHintText("Error message", "Helpful hint");
  assert.equal(text, "Error message");
});

test("Input — hint shown when no error", () => {
  const text = getHintText(undefined, "Helpful hint");
  assert.equal(text, "Helpful hint");
});

test("Input — no hint or error returns undefined", () => {
  const text = getHintText();
  assert.equal(text, undefined);
});

test("Input — label derives id correctly", () => {
  const id = deriveInputId("Full Name");
  assert.equal(id, "full-name");
});

test("Input — no label returns undefined id", () => {
  const id = deriveInputId();
  assert.equal(id, undefined);
});

test("Input — label with special chars derives clean id", () => {
  const id = deriveInputId("Wallet Address (Stellar)");
  assert.equal(id, "wallet-address-(stellar)");
});

test("Input — error variant classes differ from default", () => {
  assert.ok(inputVariants.error !== inputVariants.default);
  assert.ok(inputVariants.error.includes("accent-red"));
  assert.ok(inputVariants.default.includes("brand-500"));
});
