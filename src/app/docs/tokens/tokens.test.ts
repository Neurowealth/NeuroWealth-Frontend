import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  colorTokens,
  radiusTokens,
  shadowTokens,
  spacingTokens,
  typographyTokens,
} from "./tokens";

function parseCssCustomProperties(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const tokens = new Map<string, string>();
  const regex = /(--[a-zA-Z0-9-]+)\s*:\s*([^;]+);/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(withoutComments)) !== null) {
    tokens.set(match[1].trim(), match[2].trim().replace(/\s+/g, " "));
  }
  return tokens;
}

function normalizeTokenValue(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

test("documented design tokens match shipped values in globals.css", () => {
  const globalsPath = path.resolve(process.cwd(), "src/app/globals.css");
  const globalsCss = readFileSync(globalsPath, "utf8");
  const shippedTokens = parseCssCustomProperties(globalsCss);

  const documentedTokens = [
    ...colorTokens,
    ...typographyTokens,
    ...spacingTokens,
    ...shadowTokens,
    ...radiusTokens,
  ];

  const checked: string[] = [];

  for (const token of documentedTokens) {
    if (!token.name.startsWith("--")) {
      continue;
    }
    const shippedValue = shippedTokens.get(token.name);
    if (shippedValue === undefined) {
      continue;
    }

    checked.push(token.name);
    assert.equal(
      normalizeTokenValue(token.value),
      normalizeTokenValue(shippedValue),
      `Token ${token.name} drifted: docs have "${token.value}", globals.css has "${shippedValue}"`
    );
  }

  for (const colorToken of colorTokens) {
    assert.equal(
      normalizeTokenValue(colorToken.sample),
      normalizeTokenValue(colorToken.value),
      `Color swatch sample for ${colorToken.name} does not match its documented value`
    );
  }

  assert.ok(
    checked.length > 0,
    "Expected at least one CSS custom property to be verified against globals.css"
  );
});
