import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { render, cleanup } from "@testing-library/react";
import { ErrorPage } from "./ErrorPage";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { setupDomGlobals } from "@/test-setup";

setupDomGlobals();

const baseProps = {
  statusCode: 500,
  title: "Something broke",
  description: "Try again shortly.",
  primaryAction: { label: "Home", href: "/dashboard" },
};

test("ErrorPage — owns the main-content landmark by default", () => {
  const { container } = render(createElement(ErrorPage, baseProps));
  const landmarks = container.querySelectorAll(`#${MAIN_CONTENT_LANDMARK_ID}`);
  assert.equal(landmarks.length, 1);
  cleanup();
});

/**
 * Regression test for the ErrorPage/DashboardShell focus-target collision
 * (issue #766): DashboardShell's own layout <main> keeps the
 * MAIN_CONTENT_LANDMARK_ID landmark mounted around route-segment error
 * boundaries, since Next only swaps the error.tsx content, not the owning
 * layout. ErrorPage must not create a second element with the same id when
 * it is told (via ownsLandmark={false}, as dashboard/error.tsx and
 * dashboard/not-found.tsx do) that a parent already owns the landmark.
 *
 * This uses a minimal stand-in for DashboardShell's landmark-owning <main>
 * rather than the real DashboardShell, since DashboardShell pulls in
 * Sidebar/TopHeader/MobileBottomNav and their auth/notification contexts,
 * which is unrelated setup for what this test verifies: the id contract
 * between the two components. It mirrors DashboardShell's actual JSX
 * (a <main id={MAIN_CONTENT_LANDMARK_ID} tabIndex={-1}> wrapping children)
 * exactly, using the same imported id constant, so it breaks if either
 * component's landmark id logic changes in a conflicting way.
 */
function DashboardShellLandmarkStandIn({ children }: { children: React.ReactNode }) {
  return createElement(
    "main",
    { id: MAIN_CONTENT_LANDMARK_ID, tabIndex: -1 },
    children,
  );
}

test("ErrorPage — does not duplicate the landmark id when nested inside a layout that owns it", () => {
  const { container } = render(
    createElement(
      DashboardShellLandmarkStandIn,
      null,
      createElement(ErrorPage, { ...baseProps, ownsLandmark: false }),
    ),
  );

  const landmarks = container.querySelectorAll(`#${MAIN_CONTENT_LANDMARK_ID}`);
  assert.equal(landmarks.length, 1, "expected exactly one main-content landmark element");
  assert.equal(landmarks[0].tagName, "MAIN");
  cleanup();
});
