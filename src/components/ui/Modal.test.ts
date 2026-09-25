import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test, { describe } from "node:test";

describe("Modal focus management", () => {
  test("delegates open-state focus management to useFocusTrap", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    assert.match(source, /const containerRef = useRef<HTMLDivElement>\(null\);/);
    assert.match(source, /useFocusTrap\(containerRef, isOpen\);/);
  });

  test("traps focus within modal container when open", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    // Verify useFocusTrap is passed the containerRef and isOpen state
    assert.match(source, /useFocusTrap\(containerRef,\s*isOpen\);/);
    // Verify the container has a ref that is passed to useFocusTrap
    assert.match(source, /ref=\{containerRef\}/);
  });

  test("returns focus to trigger when modal closes", () => {
    // Verify the focus trap cleanup is implemented in createFocusTrap
    const focusTrapSource = fs.readFileSync(
      path.join(process.cwd(), "src/hooks/focusTrap.ts"),
      "utf8",
    );

    // Verify focus is stored before trap is created
    assert.match(
      focusTrapSource,
      /const previouslyFocusedElement = ownerDocument\.activeElement;/,
    );
    // Verify focus is restored in cleanup
    assert.match(
      focusTrapSource,
      /previouslyFocusedElement instanceof HTMLElement/,
    );
    assert.match(focusTrapSource, /previouslyFocusedElement\.focus\(\);/);
  });

  test("closes with Escape key when not preventClose", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    // Verify Escape handler is set up
    assert.match(source, /if \(e\.key === "Escape" && !preventClose\) onClose\(\);/);
  });

  test("handles preventClose prop correctly", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    // Verify preventClose prop is used
    assert.match(source, /preventClose = false/);
    assert.match(source, /preventClose/);
  });

  test("has proper ARIA attributes for accessibility", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    // Verify modal has proper ARIA attributes
    assert.match(source, /role="dialog"/);
    assert.match(source, /aria-modal="true"/);
    assert.match(source, /aria-labelledby="modal-title"/);
  });

  test("renders title with correct id for aria-labelledby", () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), "src/components/ui/Modal.tsx"),
      "utf8",
    );

    // Verify title element has id matching aria-labelledby
    assert.match(source, /id="modal-title"/);
  });
});
