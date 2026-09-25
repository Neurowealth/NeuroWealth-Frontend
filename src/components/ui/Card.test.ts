import assert from "node:assert/strict";
import test from "node:test";

type CardVariant = "default" | "elevated" | "outlined";

interface CardProps {
  variant?: CardVariant;
  glow?: boolean;
  className?: string;
}

const cardVariants: Record<CardVariant, string> = {
  default: "border border-gray-800 bg-gray-900",
  elevated: "border border-gray-700 bg-gray-900 shadow-md",
  outlined: "border-2 border-gray-700 bg-transparent",
};

function resolveCardClasses({ variant = "default", glow = false, className = "" }: CardProps): string {
  const base = "rounded-xl shadow-card p-6";
  const glowClasses = glow ? "shadow-sky-500/10 border-sky-500/30 shadow-lg" : "";
  return [base, cardVariants[variant], glowClasses, className].filter(Boolean).join(" ");
}

test("Card — default variant is default", () => {
  const classes = resolveCardClasses({});
  assert.ok(classes.includes(cardVariants.default));
});

test("Card — glow adds glow classes", () => {
  const classes = resolveCardClasses({ glow: true });
  assert.ok(classes.includes("shadow-sky-500/10"));
  assert.ok(classes.includes("border-sky-500/30"));
});

test("Card — without glow does not add glow classes", () => {
  const classes = resolveCardClasses({ glow: false });
  assert.ok(!classes.includes("shadow-sky-500/10"));
});

test("Card — elevated variant uses shadow-md", () => {
  const classes = resolveCardClasses({ variant: "elevated" });
  assert.ok(classes.includes("shadow-md"));
});

test("Card — outlined variant uses border-2", () => {
  const classes = resolveCardClasses({ variant: "outlined" });
  assert.ok(classes.includes("border-2"));
});

test("Card — custom className is appended", () => {
  const classes = resolveCardClasses({ className: "my-card-class" });
  assert.ok(classes.includes("my-card-class"));
});

test("Card — all variants produce distinct class sets", () => {
  const allVariants: CardVariant[] = ["default", "elevated", "outlined"];
  const classSets = allVariants.map((v) => resolveCardClasses({ variant: v }));
  assert.equal(new Set(classSets).size, allVariants.length);
});
