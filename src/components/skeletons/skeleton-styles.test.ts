import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const read = (relative: string) => readFileSync(join(here, relative), "utf8");

const css = read("../ui/Skeleton.module.css").replace(/\/\*[\s\S]*?\*\//g, "");
const definedClasses = new Set(
  [...css.matchAll(/\.([A-Za-z_][\w-]*)/g)].map((match) => match[1] ?? ""),
);

const componentFiles = readdirSync(here).filter((file) => file.endsWith(".tsx"));

test("the skeleton CSS module defines the classes the components rely on", () => {
  assert.ok(definedClasses.has("skeleton"), ".skeleton missing from Skeleton.module.css");
  assert.ok(definedClasses.has("card"), ".card missing from Skeleton.module.css");
});

test("every styles.<name> used by a skeleton component is defined in the CSS module", () => {
  for (const file of componentFiles) {
    for (const match of read(file).matchAll(/\bstyles\.([A-Za-z_]\w*)/g)) {
      const name = match[1] ?? "";
      assert.ok(definedClasses.has(name), `${file} uses styles.${name}, which Skeleton.module.css does not define`);
    }
  }
});

test("components do not use CSS-module class names as bare global classes", () => {
  const literal = /(?:className=|cn\()\s*\{?\s*["'`]([^"'`]*)["'`]/g;
  for (const file of componentFiles) {
    for (const match of read(file).matchAll(literal)) {
      const tokens = (match[1] ?? "").split(/\s+/);
      for (const bare of ["skeleton", "card"]) {
        assert.ok(
          !tokens.includes(bare),
          `${file} uses bare class "${bare}", which CSS Modules scope away; use styles.${bare}`,
        );
      }
    }
  }
});

test("SkeletonBlock and the card shells go through the CSS module", () => {
  assert.match(read("SkeletonBlock.tsx"), /cn\(styles\.skeleton,/);
  for (const file of ["SkeletonStatCard.tsx", "SkeletonAllocationWidget.tsx", "DashboardSkeleton.tsx"]) {
    assert.match(read(file), /className=\{styles\.card\}/, `${file} should use styles.card`);
  }
});
