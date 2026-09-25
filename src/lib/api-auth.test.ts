import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "src", "app", "api");

async function collectRouteFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await collectRouteFiles(full)));
    } else if (entry.isFile() && (entry.name === "route.ts" || entry.name === "route.tsx")) {
      results.push(full);
    }
  }

  return results;
}

// Routes that are intentionally public (do not call requireAuth).
const PUBLIC_ALLOWLIST = new Set<string>([
  path.join("src", "app", "api", "transaction-preview", "route.tsx"),
  path.join("src", "app", "api", "widget-preview", "route.tsx"),
]);

test("API route handlers call requireAuth or are explicitly allowlisted", async () => {
  const files = await collectRouteFiles(API_DIR);
  assert.ok(files.length > 0, "no route.ts files found under src/app/api — check paths");

  for (const file of files) {
    const rel = path.relative(ROOT, file);
    if (PUBLIC_ALLOWLIST.has(rel)) continue;

    const content = await fs.readFile(file, "utf8");
    assert.ok(
      content.includes("requireAuth(") || content.includes("requireAuth "),
      `Route ${rel} should call requireAuth or be added to PUBLIC_ALLOWLIST`
    );
  }
});

// ── requireSameOrigin CSRF guard (#876) ──────────────────────────────────

async function sameOriginStatus(headers: Record<string, string>): Promise<number | null> {
  const { NextRequest } = await import("next/server");
  const { requireAuth } = await import("./api-auth");
  const { SESSION_COOKIE_NAME } = await import("./auth-constants");

  const session = encodeURIComponent(
    JSON.stringify({ token: "t", expiresAt: Date.now() + 60_000 }),
  );
  const request = new NextRequest("https://app.example.com/api/strategy", {
    method: "PUT",
    headers: { cookie: `${SESSION_COOKIE_NAME}=${session}`, ...headers },
  });

  return requireAuth(request, { requireSameOrigin: true })?.status ?? null;
}

test("requireSameOrigin allows a matching Origin", async () => {
  assert.equal(
    await sameOriginStatus({ origin: "https://app.example.com", "sec-fetch-site": "same-origin" }),
    null,
  );
});

test("requireSameOrigin rejects a mismatched Origin", async () => {
  assert.equal(await sameOriginStatus({ origin: "https://evil.example" }), 403);
});

test("requireSameOrigin rejects Sec-Fetch-Site: cross-site", async () => {
  assert.equal(
    await sameOriginStatus({ origin: "https://app.example.com", "sec-fetch-site": "cross-site" }),
    403,
  );
});

test("requireSameOrigin fails closed when Origin and Sec-Fetch-Site are both absent", async () => {
  assert.equal(await sameOriginStatus({}), 403);
});

test("requireSameOrigin rejects a missing Origin even with Sec-Fetch-Site: same-origin", async () => {
  assert.equal(await sameOriginStatus({ "sec-fetch-site": "same-origin" }), 403);
});
