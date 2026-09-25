import test from "node:test";
import assert from "node:assert/strict";

// Mock CSS imports for Node environment
if (typeof require !== 'undefined' && require.extensions) {
  require.extensions['.css'] = (module, filename) => {
    module.exports = new Proxy({}, {
      get: (target, prop) => typeof prop === 'string' ? prop + '_mock' : undefined
    });
  };
}

test("transaction-style-utils", async (t) => {
  // Use a dynamic import to ensure the mock is applied before the file is loaded
  const { getToneClassName, getInputStateClassName } = await import("./transaction-style-utils");

  await t.test("getToneClassName returns the correct style class", () => {
    assert.equal(getToneClassName("error"), "statusError_mock");
    assert.equal(getToneClassName("warning"), "statusWarning_mock");
    assert.equal(getToneClassName("success"), "statusSuccess_mock");
  });

  await t.test("getInputStateClassName returns the correct style class", () => {
    assert.equal(getInputStateClassName("100", "Too high"), "inputError_mock");
    assert.equal(getInputStateClassName("", "Required"), "inputError_mock");
    assert.equal(getInputStateClassName("100", undefined, true), "inputSuccess_mock");
    assert.equal(getInputStateClassName("", undefined, true), "");
    assert.equal(getInputStateClassName("100", undefined, false), "");
  });
});
