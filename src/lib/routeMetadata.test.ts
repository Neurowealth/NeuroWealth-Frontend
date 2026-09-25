import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

import {
  buildBreadcrumbsFromPath,
  getRouteLabel,
  routeMetadata,
} from "@/lib/routeMetadata";

function collectAppPageRoutes(directory: string, appRoot: string): string[] {
  const routes: string[] = [];

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      routes.push(...collectAppPageRoutes(entryPath, appRoot));
      continue;
    }

    if (!entry.isFile() || entry.name !== "page.tsx") {
      continue;
    }

    const relativeDir = path.relative(appRoot, path.dirname(entryPath));

    const segments = relativeDir
      .split(path.sep)
      .filter(Boolean)
      .filter((segment) => !segment.startsWith("("));

    routes.push(`/${segments.join("/")}`);
  }

  return routes.sort();
}

function collectDashboardPageRoutes(directory: string): string[] {
  const appRoot = path.join(process.cwd(), "src/app");
  return collectAppPageRoutes(directory, appRoot);
}

test("routeMetadata covers every dashboard page route and avoids stale entries", () => {
  const dashboardRoutes = collectDashboardPageRoutes(
    path.join(process.cwd(), "src/app/dashboard"),
  );

  const missing = dashboardRoutes.filter((route) => !routeMetadata[route]);
  const stale = Object.keys(routeMetadata)
    .filter((route) => route.startsWith("/dashboard"))
    .filter((route) => !dashboardRoutes.includes(route))
    .sort();

  assert.deepEqual(missing, []);
  assert.deepEqual(stale, []);
});

test("route labels and breadcrumbs come from the shared route metadata", () => {
  assert.equal(getRouteLabel("/dashboard/settings/security"), "Security");
  assert.equal(getRouteLabel("/dashboard/missing"), "Dashboard");

  const breadcrumbs = buildBreadcrumbsFromPath("/dashboard/settings/security");
  assert.deepEqual(
    breadcrumbs.map((item) => item.label),
    ["Home", "Dashboard", "Settings", "Security"],
  );
});

test("routeMetadata covers non-dashboard auth routes", () => {
  const authAppDir = path.join(process.cwd(), "src/app/(auth)");
  const appRoot = path.join(process.cwd(), "src/app");
  const authRoutes = collectAppPageRoutes(authAppDir, appRoot);

  const missing = authRoutes.filter((route) => !routeMetadata[route]);
  assert.deepEqual(missing, [], `Auth routes missing metadata: ${missing.join(", ")}`);
});

test("routeMetadata covers non-dashboard error routes", () => {
  const errorsAppDir = path.join(process.cwd(), "src/app/(errors)");
  const appRoot = path.join(process.cwd(), "src/app");
  const errorRoutes = collectAppPageRoutes(errorsAppDir, appRoot);

  const missing = errorRoutes.filter((route) => !routeMetadata[route]);
  assert.deepEqual(missing, [], `Error routes missing metadata: ${missing.join(", ")}`);
});

test("routeMetadata covers profile and settings routes", () => {
  const appRoot = path.join(process.cwd(), "src/app");

  const profileRoutes = collectAppPageRoutes(
    path.join(appRoot, "profile"),
    appRoot,
  );
  const settingsRoutes = collectAppPageRoutes(
    path.join(appRoot, "settings"),
    appRoot,
  );

  const allRoutes = [...profileRoutes, ...settingsRoutes];
  const missing = allRoutes.filter((route) => !routeMetadata[route]);
  assert.deepEqual(missing, [], `Profile/settings routes missing metadata: ${missing.join(", ")}`);
});

test("routeMetadata covers docs routes", () => {
  const appRoot = path.join(process.cwd(), "src/app");
  const docsRoutes = collectAppPageRoutes(path.join(appRoot, "docs"), appRoot);

  const missing = docsRoutes.filter((route) => !routeMetadata[route]);
  assert.deepEqual(missing, [], `Docs routes missing metadata: ${missing.join(", ")}`);
});

test("routeMetadata covers every /demo/* route (#583)", () => {
  const appRoot = path.join(process.cwd(), "src/app");
  const demoRoutes = collectAppPageRoutes(path.join(appRoot, "demo"), appRoot);

  assert.ok(demoRoutes.length > 0, "expected at least one /demo/* page route");

  const missing = demoRoutes.filter((route) => !routeMetadata[route]);
  assert.deepEqual(missing, [], `Demo routes missing metadata: ${missing.join(", ")}`);
});

test("/demo/* routes are marked devOnly and excluded from breadcrumbs, like dashboard/dev-errors (#583)", () => {
  // /demo/* pages are gated in production by src/app/demo/layout.tsx, the same
  // pattern used by /dashboard/sandbox, /dashboard/async-states, and
  // /dashboard/dev-errors. devOnly routes are stripped from breadcrumbs (see
  // "breadcrumbs skip devOnly routes" above) — exercising that same public
  // behavior here confirms /demo/* carries the same devOnly gate.
  const breadcrumbs = buildBreadcrumbsFromPath("/demo/wallet");
  const labels = breadcrumbs.map((b) => b.label);
  assert.ok(!labels.includes("Wallet Demo"), "/demo/wallet should not appear in breadcrumbs");
});

test("src/app/demo/layout.tsx exists and gates on NODE_ENV like sandbox/async-states/dev-errors (#583)", () => {
  const layoutPath = path.join(process.cwd(), "src/app/demo/layout.tsx");
  assert.ok(fs.existsSync(layoutPath), "expected src/app/demo/layout.tsx to exist");

  const source = fs.readFileSync(layoutPath, "utf8");
  assert.match(source, /NODE_ENV/, "expected demo layout to gate on NODE_ENV");
});

test("routeMetadata entries reference App Router files that exist on disk", () => {
  const appRoot = path.join(process.cwd(), "src/app");
  const knownRoutes = Object.keys(routeMetadata).filter(
    (r) => !r.startsWith("#"),
  );

  const missingFiles: string[] = [];

  for (const route of knownRoutes) {
    // Strip leading slash, build candidate paths considering route groups
    const relative = route === "/" ? "" : route.slice(1);
    const segments = relative.split("/").filter(Boolean);

    if (segments.length === 0) {
      // Root page
      const rootPage = path.join(appRoot, "page.tsx");
      if (!fs.existsSync(rootPage)) {
        missingFiles.push(`${route} → ${rootPage}`);
      }
      continue;
    }

    // Build direct path first
    const directPath = path.join(appRoot, ...segments, "page.tsx");
    if (fs.existsSync(directPath)) continue;

    // Try route groups: check common wrappers (auth), (errors)
    const routeGroups = ["(auth)", "(errors)"];
    const foundInGroup = routeGroups.some((group) => {
      const grouped = path.join(appRoot, group, ...segments, "page.tsx");
      return fs.existsSync(grouped);
    });

    if (!foundInGroup) {
      missingFiles.push(`${route} → ${directPath}`);
    }
  }

  assert.deepEqual(
    missingFiles,
    [],
    `Metadata entries reference missing App Router files:\n${missingFiles.join("\n")}`,
  );
});

test("profile route has correct label", () => {
  assert.equal(routeMetadata["/profile"]?.label, "Profile");
  assert.equal(routeMetadata["/profile"]?.href, "/profile");
});

test("settings route has correct label", () => {
  assert.equal(routeMetadata["/settings"]?.label, "Settings");
  assert.equal(routeMetadata["/settings"]?.href, "/settings");
});

test("docs routes have correct labels", () => {
  assert.equal(routeMetadata["/docs/tokens"]?.label, "Design Tokens");
  assert.equal(routeMetadata["/docs/charts"]?.label, "Charts");
});

test("auth routes have correct labels", () => {
  assert.equal(routeMetadata["/login"]?.label, "Login");
  assert.equal(routeMetadata["/signup"]?.label, "Sign Up");
});

test("breadcrumbs for profile path are correct", () => {
  const breadcrumbs = buildBreadcrumbsFromPath("/profile");
  assert.deepEqual(
    breadcrumbs.map((b) => b.label),
    ["Home", "Profile"],
  );
  assert.equal(breadcrumbs[1]?.isCurrentPage, true);
});

test("breadcrumbs for settings path are correct", () => {
  const breadcrumbs = buildBreadcrumbsFromPath("/settings");
  assert.deepEqual(
    breadcrumbs.map((b) => b.label),
    ["Home", "Settings"],
  );
});

test("breadcrumbs for docs/tokens path are correct", () => {
  const breadcrumbs = buildBreadcrumbsFromPath("/docs/tokens");
  assert.deepEqual(
    breadcrumbs.map((b) => b.label),
    ["Home", "Docs", "Design Tokens"],
  );
});

test("breadcrumbs skip devOnly routes", () => {
  const breadcrumbs = buildBreadcrumbsFromPath("/dashboard/dev-errors/boundary-error");
  const labels = breadcrumbs.map((b) => b.label);
  assert.ok(!labels.includes("Dev Errors"), "dev-errors should not appear in breadcrumbs");
  assert.ok(!labels.includes("Boundary Error"), "boundary-error should not appear in breadcrumbs");
  assert.deepEqual(labels, ["Home", "Dashboard"]);
});
