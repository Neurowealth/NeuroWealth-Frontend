import { test } from "node:test";
import { strict as assert } from "node:assert";
import { strategyKindSchema } from "./api.ts";

test("strategyKindSchema validates valid strategies", () => {
  assert.doesNotThrow(() => {
    strategyKindSchema.parse("conservative");
    strategyKindSchema.parse("balanced");
    strategyKindSchema.parse("growth");
  });
});

test("strategyKindSchema rejects invalid strategies", () => {
  assert.throws(() => {
    strategyKindSchema.parse("invalid");
  });

  assert.throws(() => {
    strategyKindSchema.parse(123);
  });

  assert.throws(() => {
    strategyKindSchema.parse(null);
  });
});

test("strategyKindSchema safeParse returns success for valid input", () => {
  const result = strategyKindSchema.safeParse("balanced");
  assert.equal(result.success, true);
  if (result.success) {
    assert.equal(result.data, "balanced");
  }
});

test("strategyKindSchema safeParse returns error for invalid input", () => {
  const result = strategyKindSchema.safeParse("invalid");
  assert.equal(result.success, false);
});
