import assert from "node:assert/strict";
import test from "node:test";
import { setupDomGlobals } from "@/test-setup";
import { findSwkModal } from "./WalletConnectButton";

setupDomGlobals();

test("findSwkModal — finds matching element directly or as a descendant", () => {
  // Test direct match on element itself
  const directEl = document.createElement("div");
  directEl.className = "swk-modal-container";
  assert.equal(findSwkModal(directEl), directEl);

  // Test match on descendant element
  const parentEl = document.createElement("div");
  const childEl = document.createElement("div");
  childEl.className = "swk-inner";
  parentEl.appendChild(childEl);
  assert.equal(findSwkModal(parentEl), childEl);

  // Test modal class fallback
  const modalParent = document.createElement("div");
  const modalChild = document.createElement("div");
  modalChild.className = "generic-modal-overlay";
  modalParent.appendChild(modalChild);
  assert.equal(findSwkModal(modalParent), modalChild);

  // Test no match
  const plainEl = document.createElement("div");
  const plainChild = document.createElement("p");
  plainEl.appendChild(plainChild);
  assert.equal(findSwkModal(plainEl), null);
});
