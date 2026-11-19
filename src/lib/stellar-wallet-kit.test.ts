import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import { JSDOM } from "jsdom";
import { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import {
  getKit,
  kit,
  resetKitInstance,
  signTransaction,
  SSR_KIT_UNAVAILABLE_ERROR,
} from "@/lib/stellar-wallet-kit";

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
const originalCustomElements = globalThis.customElements;
const originalHTMLElement = globalThis.HTMLElement;

function restoreGlobals() {
  resetKitInstance();

  if (originalWindow === undefined) {
    delete (globalThis as { window?: unknown }).window;
  } else {
    globalThis.window = originalWindow;
  }

  if (originalDocument === undefined) {
    delete (globalThis as { document?: unknown }).document;
  } else {
    globalThis.document = originalDocument;
  }

  if (originalCustomElements === undefined) {
    delete (globalThis as { customElements?: unknown }).customElements;
  } else {
    globalThis.customElements = originalCustomElements;
  }

  if (originalHTMLElement === undefined) {
    delete (globalThis as { HTMLElement?: unknown }).HTMLElement;
  } else {
    globalThis.HTMLElement = originalHTMLElement;
  }
}

describe("stellar-wallet-kit", () => {
  afterEach(() => {
    restoreGlobals();
  });

  describe("server-side (no window)", () => {
    it("throws a descriptive error when getKit() is called without window", () => {
      delete (globalThis as { window?: unknown }).window;

      assert.throws(() => getKit(), {
        name: "Error",
        message: SSR_KIT_UNAVAILABLE_ERROR,
      });
    });

    it("throws a descriptive error when kit() is called without window", () => {
      delete (globalThis as { window?: unknown }).window;

      assert.throws(() => kit(), {
        name: "Error",
        message: SSR_KIT_UNAVAILABLE_ERROR,
      });
    });

    it("rejects signTransaction with the descriptive SSR error instead of a TypeError", async () => {
      delete (globalThis as { window?: unknown }).window;

      await assert.rejects(
        () =>
          signTransaction({
            unsignedTransaction: "AAAA",
            address: "GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G",
          }),
        {
          name: "Error",
          message: SSR_KIT_UNAVAILABLE_ERROR,
        },
      );
    });
  });

  describe("browser environment (window defined)", () => {
    it("returns a StellarWalletsKit instance and caches it as a singleton", () => {
      const dom = new JSDOM("<!doctype html><html><body></body></html>", {
        url: "http://localhost:3000",
      });

      globalThis.window = dom.window as unknown as Window & typeof globalThis;
      globalThis.document = dom.window.document;
      globalThis.customElements = dom.window.customElements;
      globalThis.HTMLElement = dom.window.HTMLElement;

      const first = getKit();
      const second = getKit();
      const viaAlias = kit();

      assert.ok(first instanceof StellarWalletsKit);
      assert.strictEqual(first, second);
      assert.strictEqual(first, viaAlias);
    });
  });
});
