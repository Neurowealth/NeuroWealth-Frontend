import "@/test-utils/jsdom-setup";

import assert from "node:assert/strict";
import test, { mock } from "node:test";
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";
// This test mounts AuthProvider directly to isolate its storage listener.
// eslint-disable-next-line no-restricted-imports
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { SESSION_STORAGE_KEY } from "@/lib/auth-constants";
import { adaptMockAuthUser } from "@/lib/user";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

function AuthStateProbe() {
  const { user } = useAuth();
  return createElement("span", null, user?.id ?? "signed-out");
}

function seedSession(expiresAt: number) {
  const user = adaptMockAuthUser({
    id: "usr_test",
    email: "fixture@example.com",
    name: "Fixture User",
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(
    SESSION_STORAGE_KEY,
    JSON.stringify({
      user,
      token: "fixture-token",
      expiresAt,
    }),
  );
}

test("AuthContext syncs sign-out after a cross-tab localStorage.clear event", () => {
  seedSession(Date.now() + 60_000);

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    act(() => {
      root.render(
        createElement(
          AppRouterContext.Provider,
          { value: {} as never },
          createElement(
            AuthProvider,
            null,
            createElement(AuthStateProbe),
          ),
        ),
      );
    });
    assert.equal(container.textContent, "usr_test");

    localStorage.clear();
    act(() => {
      window.dispatchEvent(
        new StorageEvent("storage", { key: null, storageArea: localStorage }),
      );
    });

    assert.equal(container.textContent, "signed-out");
  } finally {
    act(() => root.unmount());
    container.remove();
  }
});

test("AuthContext signs out an open tab when the session expires", (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });

  seedSession(60_000);

  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  try {
    act(() => {
      root.render(
        createElement(
          AppRouterContext.Provider,
          { value: {} as never },
          createElement(
            AuthProvider,
            null,
            createElement(AuthStateProbe),
          ),
        ),
      );
    });
    assert.equal(container.textContent, "usr_test");

    act(() => {
      t.mock.timers.tick(59_999);
    });
    assert.equal(container.textContent, "usr_test");

    act(() => {
      t.mock.timers.tick(1);
    });
    assert.equal(container.textContent, "signed-out");
  } finally {
    act(() => root.unmount());
    container.remove();
    t.mock.timers.reset();
  }
});
