import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("./PrivacyModal.tsx", import.meta.url),
  "utf8",
);

test("PrivacyModal wires the shared focus trap on its dialog container", () => {
  assert.match(source, /import \{ useFocusTrap \} from "@\/hooks\/useFocusTrap";/);
  assert.match(source, /const containerRef = useRef<HTMLDivElement>\(null\);/);
  assert.match(source, /useFocusTrap\(containerRef, showModal\);/);
  assert.match(source, /ref=\{containerRef\}/);
  assert.match(source, /ref=\{containerRef\}[^>]*role="dialog"/);
});

test("PrivacyModal Escape closes the dialog", () => {
  assert.match(source, /e\.key === "Escape"/);
  assert.match(source, /closeModal\(\)/);
  assert.match(source, /document\.addEventListener\("keydown", onKey\)/);
});

test("PrivacyModal restores focus to the triggering button on close", () => {
  assert.match(source, /previousFocusRef\.current = document\.activeElement/);
  assert.match(source, /previousFocusRef\.current\.focus\(\)/);
  assert.ok(
    /else if \(previousFocusRef\.current\)/.test(source),
    "focus restoration runs when the modal transitions from open to closed",
  );
});