import assert from "node:assert/strict";
import test from "node:test";
import { setupDomGlobals } from "@/test-setup";
import { findSwkModal, isSwkBoilerplateText } from "./WalletConnectButton";

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

test("isSwkBoilerplateText — matches the vendor modal boilerplate only (#1128)", () => {
  assert.equal(isSwkBoilerplateText("Learn more"), true);
  assert.equal(isSwkBoilerplateText("What is a Wallet?"), true);
  assert.equal(isSwkBoilerplateText("Stellar is a decentralized network"), true);
  // Our own (localized) copy must never be hidden by the filter.
  assert.equal(isSwkBoilerplateText("Connect Wallet"), false);
  assert.equal(isSwkBoilerplateText("Connecter le wallet"), false);
  assert.equal(isSwkBoilerplateText("Freighter"), false);
});
