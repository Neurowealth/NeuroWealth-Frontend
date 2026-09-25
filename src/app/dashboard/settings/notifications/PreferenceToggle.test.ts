import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup, fireEvent } from "@testing-library/react";
import { PreferenceToggle } from "./PreferenceToggle";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

/**
 * Regression test for issue #769: PreferenceToggle's wrapper was changed
 * from a <label> to a plain <div>, and Switch was rendered with no label,
 * so the checkbox had no accessible name and clicking the title/description
 * text no longer toggled it.
 */
test("PreferenceToggle — the switch has the title as its accessible name", () => {
  const { getByRole } = render(
    createElement(PreferenceToggle, {
      id: "email-notifications",
      title: "Email notifications",
      description: "Receive updates by email.",
      checked: false,
      disabled: false,
      onChange: () => {},
    }),
  );

  const checkbox = getByRole("checkbox", { name: "Email notifications" });
  assert.ok(checkbox, "expected a checkbox with an accessible name matching the title");
  cleanup();
});

test("PreferenceToggle — clicking the title text toggles the switch", () => {
  let toggled = 0;
  // The title text appears twice: once visibly in the clickable <div>, and
  // once as Switch's own sr-only accessible-name span. getAllByText picks
  // both up; the first match is the visible title <p>.
  const { getAllByText, getByRole } = render(
    createElement(PreferenceToggle, {
      id: "email-notifications",
      title: "Email notifications",
      description: "Receive updates by email.",
      checked: false,
      disabled: false,
      onChange: () => {
        toggled += 1;
      },
    }),
  );

  fireEvent.click(getAllByText("Email notifications")[0]);
  assert.equal(toggled, 1, "clicking the title text should call onChange once");

  const checkbox = getByRole("checkbox", { name: "Email notifications" }) as HTMLInputElement;
  assert.equal(checkbox.disabled, false);
  cleanup();
});

test("PreferenceToggle — clicking the description text also toggles the switch", () => {
  let toggled = 0;
  const { getByText } = render(
    createElement(PreferenceToggle, {
      id: "email-notifications",
      title: "Email notifications",
      description: "Receive updates by email.",
      checked: false,
      disabled: false,
      onChange: () => {
        toggled += 1;
      },
    }),
  );

  fireEvent.click(getByText("Receive updates by email."));
  assert.equal(toggled, 1, "clicking the description text should call onChange once");
  cleanup();
});
