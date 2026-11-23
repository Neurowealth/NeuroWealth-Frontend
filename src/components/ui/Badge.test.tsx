import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import postcss from "postcss";
import tailwindcss from "@tailwindcss/postcss";
import React, { createElement } from "react";
import { cleanup, render } from "@testing-library/react";
import { setupDomGlobals } from "@/test-setup";
import { Badge } from "./Badge";

setupDomGlobals();
Object.assign(globalThis, { React });

test("Badge success variant renders classes present in generated Tailwind CSS", async () => {
  const { container } = render(
    createElement(Badge, { variant: "success" }, "Connected"),
  );

  try {
    const badge = container.querySelector("span");
    assert.ok(badge, "success badge should render a span");

    const expectedClasses = [
      "bg-emerald-100",
      "text-emerald-700",
      "dark:bg-emerald-500/20",
      "dark:text-emerald-400",
    ];
    for (const className of expectedClasses) {
      assert.ok(badge.classList.contains(className), `badge is missing ${className}`);
    }

    const globalsCssPath = path.join(process.cwd(), "src/app/globals.css");
    const globalsCss = fs.readFileSync(globalsCssPath, "utf8");
    const generatedCss = await postcss([tailwindcss()]).process(globalsCss, {
      from: globalsCssPath,
    });

    for (const className of expectedClasses) {
      const selector = `.${className.replaceAll(":", "\\:").replaceAll("/", "\\/")}`;
      assert.ok(
        generatedCss.css.includes(selector),
        `generated CSS is missing the ${className} utility selector`,
      );
    }
  } finally {
    cleanup();
  }
});
