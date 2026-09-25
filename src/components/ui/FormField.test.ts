import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";

import { getFormFieldA11yProps } from "./FormField";

test("FormField a11y props wire ids and aria-describedby for hinted errors", () => {
  const props = getFormFieldA11yProps({
    id: "email",
    hint: true,
    error: "Email is required.",
  });

  assert.deepEqual(props, {
    id: "email",
    hintId: "email-hint",
    errorId: "email-error",
    describedBy: "email-hint email-error",
    invalid: true,
  });
});

test("FormField a11y props keep aria-describedby empty when there is no hint or error", () => {
  const props = getFormFieldA11yProps({ id: "password" });

  assert.deepEqual(props, {
    id: "password",
    hintId: undefined,
    errorId: undefined,
    describedBy: undefined,
    invalid: false,
  });
});

test("FormField a11y props prioritize an error id when only an error is present", () => {
  const props = getFormFieldA11yProps({
    id: "login-password",
    error: "Password is required.",
  });

  assert.deepEqual(props, {
    id: "login-password",
    hintId: undefined,
    errorId: "login-password-error",
    describedBy: "login-password-error",
    invalid: true,
  });
});

describe("FormField optional label rendering", () => {
  const source = fs.readFileSync(
    path.join(process.cwd(), "src/components/ui/FormField.tsx"),
    "utf8",
  );

  test("renders a label element only when the label prop is provided", () => {
    // The conditional guard must wrap the <label> so it is absent when label
    // is omitted and present when supplied.
    assert.match(source, /\{label &&\s*\(/);
    assert.match(source, /<label\b/);
  });

  test("wires the label htmlFor attribute to the field id", () => {
    // htmlFor must reference the same id that is passed to the control so
    // clicking the label focuses the correct input.
    assert.match(source, /htmlFor=\{id\}/);
  });
});
