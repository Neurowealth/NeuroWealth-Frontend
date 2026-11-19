import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dictionaries, type AppLocale } from "./messages";

// #1093 — the `en` and `fr` dictionaries are hand-maintained objects typed as
// AppMessages. A key added to only one locale (or an array that drifts in
// length) can slip through review and silently fall back at render time for
// the other locale. Diff the two structurally so that cannot happen silently.

interface DictionaryShape {
  /** Every locale-relative path present in the dictionary. */
  paths: Set<string>;
  /** Leaf path -> runtime value type, used to catch type drift. */
  leaves: Map<string, string>;
}

function typeName(value: unknown): string {
  if (Array.isArray(value)) return "array";
  if (value === null) return "null";
  return typeof value;
}

function collectShape(value: unknown, path: string, shape: DictionaryShape) {
  if (Array.isArray(value)) {
    // Indexing array items means a locale with a shorter (or longer) list
    // fails the diff, not just a locale with different item keys.
    shape.paths.add(`${path}[]`);
    value.forEach((item, index) => {
      collectShape(item, `${path}[${index}]`, shape);
    });
    return;
  }

  if (value !== null && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      collectShape(child, path ? `${path}.${key}` : key, shape);
    }
    return;
  }

  shape.paths.add(path);
  shape.leaves.set(path, typeName(value));
}

function shapeOf(locale: AppLocale): DictionaryShape {
  const shape: DictionaryShape = { paths: new Set(), leaves: new Map() };
  collectShape(dictionaries[locale], "", shape);
  return shape;
}

function difference(from: Set<string>, to: Set<string>) {
  return [...from].filter((entry) => !to.has(entry)).sort();
}

describe("i18n message dictionaries shape parity (#1093)", () => {
  const en = shapeOf("en");
  const fr = shapeOf("fr");

  it("exposes a non-trivial dictionary for both locales", () => {
    assert.ok(en.paths.size > 100, `expected a large en dictionary, got ${en.paths.size} paths`);
    assert.ok(fr.paths.size > 100, `expected a large fr dictionary, got ${fr.paths.size} paths`);
  });

  it("has no key present in en but missing from fr", () => {
    const missingInFr = difference(en.paths, fr.paths);
    assert.deepEqual(
      missingInFr,
      [],
      `fr is missing ${missingInFr.length} key path(s) that en defines: ${missingInFr.join(", ")}`,
    );
  });

  it("has no key present in fr but missing from en", () => {
    const missingInEn = difference(fr.paths, en.paths);
    assert.deepEqual(
      missingInEn,
      [],
      `en is missing ${missingInEn.length} key path(s) that fr defines: ${missingInEn.join(", ")}`,
    );
  });

  it("matches the locale-relative path count", () => {
    assert.equal(fr.paths.size, en.paths.size);
  });

  it("uses the same value type for every shared leaf", () => {
    const mismatched: string[] = [];

    for (const [path, kind] of en.leaves) {
      const frKind = fr.leaves.get(path);
      if (frKind !== undefined && frKind !== kind) {
        mismatched.push(`${path}: en=${kind} fr=${frKind}`);
      }
    }

    assert.deepEqual(mismatched, [], `locale value types drift: ${mismatched.join(", ")}`);
  });

  it("does not ship empty strings for either locale", () => {
    const empty: string[] = [];
    for (const locale of ["en", "fr"] as const) {
      for (const [path, kind] of shapeOf(locale).leaves) {
        if (kind !== "string") continue;
        const value = resolve(locale, path);
        if (typeof value === "string" && value.trim() === "") {
          empty.push(`${locale}.${path}`);
        }
      }
    }
    assert.deepEqual(empty, [], `empty translation(s): ${empty.join(", ")}`);
  });
});

// #1126 — a hardcoded literal once shipped UTF-8 bytes decoded as Windows-1252
// ("â€¦" instead of "…"). Guard every translation against that class of
// mojibake so it cannot slip back in through the dictionaries.
describe("i18n message dictionaries encoding (#1126)", () => {
  const MOJIBAKE = /â€|Ã[\u0080-\u00BF]|Â[\u00A0-\u00BF]|\uFFFD/;

  it("contains no mojibake sequences in either locale", () => {
    const corrupted: string[] = [];
    for (const locale of ["en", "fr"] as const) {
      for (const [path, kind] of shapeOf(locale).leaves) {
        if (kind !== "string") continue;
        const value = resolve(locale, path);
        if (typeof value === "string" && MOJIBAKE.test(value)) {
          corrupted.push(`${locale}.${path}`);
        }
      }
    }
    assert.deepEqual(corrupted, [], `mojibake in: ${corrupted.join(", ")}`);
  });

  it("keeps the transaction-history loading copy wired up (#1126)", () => {
    for (const locale of ["en", "fr"] as const) {
      const history = dictionaries[locale].transactions.history;
      assert.ok(history.loadingLabel.length > 0);
      assert.ok(history.loadingText.endsWith("…"), `${locale} loadingText should end with "…"`);
    }
  });
});

// #1130 — interpolated TransactionList copy must keep its placeholder in
// every locale, or the count silently disappears from the UI.
describe("transactions.list placeholders (#1130)", () => {
  for (const locale of ["en", "fr"] as const) {
    it(`${locale} resultsCount and caption include {count}`, () => {
      const list = dictionaries[locale].transactions.list;
      assert.ok(list.resultsCount.includes("{count}"));
      assert.ok(list.caption.includes("{count}"));
    });
  }
});

/** Read a locale-relative leaf path back out of a dictionary. */
function resolve(locale: AppLocale, path: string): unknown {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce<unknown>(
      (node, segment) =>
        node === null || node === undefined
          ? undefined
          : (node as Record<string, unknown>)[segment],
      dictionaries[locale],
    );
}
