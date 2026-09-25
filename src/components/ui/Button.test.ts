import assert from "node:assert/strict";
import test from "node:test";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
}

const variants: Record<Variant, string> = {
  primary: "bg-sky-500",
  secondary: "border border-sky-500/60",
  ghost: "text-slate-400",
  destructive: "bg-red-500",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

function resolveButtonClasses({
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
}: ButtonProps): string {
  const base = "inline-flex items-center justify-center gap-2 text-center whitespace-normal leading-snug transition-all duration-200";
  const state = disabled ? "opacity-50 cursor-not-allowed" : "";
  return [base, variants[variant], sizes[size], state, className].join(" ");
}

test("Button — default variant is primary", () => {
  const classes = resolveButtonClasses({});
  assert.ok(classes.includes(variants.primary));
});

test("Button — size md is default", () => {
  const classes = resolveButtonClasses({});
  assert.ok(classes.includes(sizes.md));
});

test("Button — disabled adds opacity class", () => {
  const classes = resolveButtonClasses({ disabled: true });
  assert.ok(classes.includes("opacity-50"));
  assert.ok(classes.includes("cursor-not-allowed"));
});

test("Button — all variants produce distinct class sets", () => {
  const allVariants: Variant[] = ["primary", "secondary", "ghost", "destructive"];
  const classSets = allVariants.map((v) => resolveButtonClasses({ variant: v }));
  assert.equal(new Set(classSets).size, allVariants.length);
});

test("Button — all sizes produce distinct class sets", () => {
  const allSizes: Size[] = ["sm", "md", "lg"];
  const classSets = allSizes.map((s) => resolveButtonClasses({ size: s }));
  assert.equal(new Set(classSets).size, allSizes.length);
});

test("Button — custom className is appended", () => {
  const classes = resolveButtonClasses({ className: "my-custom-class" });
  assert.ok(classes.includes("my-custom-class"));
});

test("Button — variant classes are mutually exclusive", () => {
  const allVariants: Variant[] = ["primary", "secondary", "ghost", "destructive"];
  for (const v of allVariants) {
    const classes = resolveButtonClasses({ variant: v });
    for (const other of allVariants) {
      if (other !== v) {
        assert.ok(!classes.includes(variants[other]), `${v} should not contain ${other} classes`);
      }
    }
  }
});
