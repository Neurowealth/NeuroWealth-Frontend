import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

type WalletStatusBadgeSize = "sm" | "md" | "lg";

const sizeClasses: Record<WalletStatusBadgeSize, string> = {
  sm: "px-2.5 py-1 text-xs",
  md: "px-3.5 py-2 text-sm",
  lg: "px-4 py-2.5 text-base",
};

const iconSizeClasses: Record<WalletStatusBadgeSize, string> = {
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const source = readFileSync(
  new URL("./WalletStatusBadge.tsx", import.meta.url),
  "utf8",
);

test("WalletStatusBadge — defines distinct sizeClasses and iconSizeClasses for sm, md, lg", () => {
  const sizes: WalletStatusBadgeSize[] = ["sm", "md", "lg"];
  assert.equal(new Set(sizes.map((s) => sizeClasses[s])).size, 3);
  assert.equal(new Set(sizes.map((s) => iconSizeClasses[s])).size, 3);
  for (const s of sizes) {
    assert.ok(source.includes(sizeClasses[s]), `Expected sizeClasses[${s}] in source`);
    assert.ok(source.includes(iconSizeClasses[s]), `Expected iconSizeClasses[${s}] in source`);
  }
});

test("WalletStatusBadge — compact branch wires iconSizeClasses[size] without conflicting container sizeClasses on Badge", () => {
  assert.match(source, /if \(compact\)/);
  assert.match(source, /className="gap-2"/);
  assert.match(source, /<CheckCircleIcon className=\{`\$\{iconSizeClasses\[size\]\}`\} \/>/);
});

test("WalletStatusBadge — non-compact branch wires sizeClasses[size] on container and iconSizeClasses[size] on all icons", () => {
  assert.match(
    source,
    /className=\{`rounded-lg border border-surface-border bg-surface \$\{sizeClasses\[size\]\} space-y-2`\}/,
  );
  assert.match(
    source,
    /<CheckCircleIcon className=\{`\$\{iconSizeClasses\[size\]\} text-success`\} \/>/,
  );
  assert.match(
    source,
    /<WalletIcon\s+className=\{`\$\{iconSizeClasses\[size\]\} text-text-secondary mt-0\.5 flex-shrink-0`\}/,
  );
  assert.match(
    source,
    /<WarningIcon className=\{`\$\{iconSizeClasses\[size\]\}`\} \/>/,
  );
  // Ensure no hardcoded w-4 h-4 remains on JSX icon elements
  assert.doesNotMatch(source, /<(?:CheckCircleIcon|WalletIcon|WarningIcon)[^>]*w-4 h-4/);
});

test("WalletStatusBadge — returns null when wallet is disconnected or publicKey is missing", () => {
  assert.match(source, /if \(!connected \|\| !publicKey\) \{\s*return null;\s*\}/);
});
