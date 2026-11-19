import assert from "node:assert/strict";
import test from "node:test";
import React from "react";
import { cleanup, render, within } from "@testing-library/react";
import { I18nProvider } from "@/contexts/I18nContext";
import { STORAGE_KEYS } from "@/lib/storage-keys";
import { setupDomGlobals } from "@/test-setup";
import Pagination from "./Pagination";

setupDomGlobals();

test("Pagination renders French controls, live status, and result range", (t) => {
  localStorage.setItem(STORAGE_KEYS.LOCALE, "fr");
  t.after(() => {
    cleanup();
    localStorage.removeItem(STORAGE_KEYS.LOCALE);
  });

  const { getByRole } = render(
    <I18nProvider>
      <Pagination totalItems={65} currentPage={2} />
    </I18nProvider>,
  );

  const pagination = within(getByRole("navigation", { name: "Pagination" }));
  assert.equal(pagination.getByRole("status").textContent, "Page 2 sur 7");
  pagination.getByRole("button", { name: "Page précédente" });
  pagination.getByRole("button", { name: "Page suivante" });
  const currentPage = pagination.getByRole("button", { name: "Page 2", exact: true });
  assert.equal(currentPage.getAttribute("aria-current"), "page");
  pagination.getByRole("spinbutton", { name: "Aller à la page" });
  pagination.getByText("Aller à", { selector: "label" });
  pagination.getByText("11–20 sur 65");
});
