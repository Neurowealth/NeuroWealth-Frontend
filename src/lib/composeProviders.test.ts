import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { composeProviders } from "./composeProviders";

function makeProvider(name: string) {
  return function Provider({ children }: { children: ReactNode }) {
    return createElement("div", { "data-provider": name }, children);
  };
}

describe("composeProviders", () => {
  it("nests providers in the given array order", () => {
    const A = makeProvider("A");
    const B = makeProvider("B");
    const C = makeProvider("C");

    const AllProviders = composeProviders([A, B, C]);
    const html = renderToStaticMarkup(
      createElement(AllProviders, null, createElement("span", null, "leaf")),
    );

    const posA = html.indexOf('data-provider="A"');
    const posB = html.indexOf('data-provider="B"');
    const posC = html.indexOf('data-provider="C"');
    const posLeaf = html.indexOf("leaf");

    assert.ok(posA < posB && posB < posC && posC < posLeaf, "expected A to wrap B to wrap C to wrap leaf");
  });

  it("applies props only to tuple entries, not bare components", () => {
    function WithProps({ children, label }: { children: ReactNode; label: string }) {
      return createElement("div", { "data-label": label }, children);
    }
    const Bare = makeProvider("Bare");

    const AllProviders = composeProviders([
      Bare,
      [WithProps, { label: "tagged" }],
    ]);
    const html = renderToStaticMarkup(
      createElement(AllProviders, null, createElement("span", null, "leaf")),
    );

    assert.ok(html.includes('data-label="tagged"'));
    assert.ok(html.includes('data-provider="Bare"'));
  });
});
