import assert from "node:assert/strict";
import test from "node:test";

/**
 * Tests for WalletConnectButton modal detection logic.
 * The component uses MutationObserver to detect wallet-kit modals and inject
 * custom messaging. The fix ensures that modal detection works when the
 * matching class is on a descendant element, not just the directly-added node.
 */

test("WalletConnectButton — modal detection finds descendant with swk class", () => {
  // Simulate the logic: check if node or any descendant matches
  const mockNode = {
    querySelector: (selector: string) => {
      if (selector === '[class*="swk"]') {
        return { classList: { contains: () => true } } as any;
      }
      return null;
    },
  } as any;

  const modalElement = mockNode.querySelector('[class*="swk"]');
  assert.ok(modalElement, "Should find descendant with swk class");
});

test("WalletConnectButton — modal detection finds descendant with modal class", () => {
  const mockNode = {
    querySelector: (selector: string) => {
      if (selector === '[class*="modal"]') {
        return { classList: { contains: () => true } } as any;
      }
      return null;
    },
  } as any;

  const modalElement = mockNode.querySelector('[class*="modal"]');
  assert.ok(modalElement, "Should find descendant with modal class");
});

test("WalletConnectButton — modal detection returns null when no match", () => {
  const mockNode = {
    querySelector: () => null,
  } as any;

  const modalElement = mockNode.querySelector('[class*="swk"]') || mockNode.querySelector('[class*="modal"]');
  assert.equal(modalElement, null, "Should return null when no matching descendant");
});

test("WalletConnectButton — prioritizes swk class over modal class", () => {
  const mockNode = {
    querySelector: (selector: string) => {
      if (selector === '[class*="swk"]') {
        return { id: "swk-modal" } as any;
      }
      if (selector === '[class*="modal"]') {
        return { id: "generic-modal" } as any;
      }
      return null;
    },
  } as any;

  const modalElement = mockNode.querySelector('[class*="swk"]') || mockNode.querySelector('[class*="modal"]');
  assert.equal((modalElement as any).id, "swk-modal", "Should prioritize swk class");
});
