import assert from "node:assert/strict";
import test from "node:test";

import { ApiRequestError, apiRequest } from "@/lib/api-client";

const originalFetch = globalThis.fetch;
const originalEnv = { ...process.env };

test.afterEach(() => {
  globalThis.fetch = originalFetch;
  process.env = { ...originalEnv };
});

test("apiRequest returns typed data from success envelope", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({
      success: true,
      data: {
        quote: "ok",
      },
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });

  const result = await apiRequest<{ quote: string }>("/api/test", {
    method: "POST",
    body: { input: true },
    baseUrl: "https://example.com",
  });

  assert.equal(result.quote, "ok");
});

test("apiRequest maps envelope errors to ApiRequestError", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid payload",
        details: {
          amount: ["Amount is required"],
        },
      },
    }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });

  await assert.rejects(
    () => apiRequest("/api/test"),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "VALIDATION_ERROR");
      assert.equal(error.status, 400);
      assert.deepEqual(error.details, {
        amount: ["Amount is required"],
      });
      return true;
    },
  );
});

test("apiRequest rejects invalid JSON payloads", async () => {
  globalThis.fetch = async () =>
    new Response("<html>error</html>", {
      status: 502,
      headers: {
        "Content-Type": "text/html",
      },
    });

  await assert.rejects(
    () => apiRequest("/api/test"),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "INVALID_JSON");
      assert.equal(error.status, 502);
      return true;
    },
  );
});

test("apiRequest maps network failures to NETWORK_ERROR", async () => {
  globalThis.fetch = async () => {
    throw new TypeError("Failed to fetch");
  };

  await assert.rejects(
    () => apiRequest("/api/test"),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "NETWORK_ERROR");
      assert.equal(error.status, 503);
      return true;
    },
  );
});

test("apiRequest rejects payloads that are not the success/error envelope", async () => {
  globalThis.fetch = async () =>
    new Response(JSON.stringify({ unexpected: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  await assert.rejects(
    () => apiRequest("/api/test"),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "INVALID_ENVELOPE");
      return true;
    },
  );
});

test("apiRequest sets Content-Type and Accept headers automatically for JSON bodies", async () => {
  let capturedHeaders!: Headers;

  globalThis.fetch = async (_url, init) => {
    capturedHeaders = new Headers(init?.headers);
    return new Response(JSON.stringify({ success: true, data: null }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  await apiRequest("/api/test", { method: "POST", body: { x: 1 } });

  assert.equal(capturedHeaders.get("Content-Type"), "application/json");
  assert.equal(capturedHeaders.get("Accept"), "application/json");
});

test("apiRequest rejects timed-out requests with REQUEST_TIMEOUT", async () => {
  globalThis.fetch = async (_url, init) => {
    return new Promise((_resolve, reject) => {
      const signal = init?.signal;
      if (!signal) return;

      signal.addEventListener(
        "abort",
        () => reject(new DOMException("The operation was aborted.", "AbortError")),
        { once: true },
      );
    });
  };

  await assert.rejects(
    () => apiRequest("/api/test", { timeoutMs: 50 }),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "REQUEST_TIMEOUT");
      assert.equal(error.status, 408);
      assert.match(error.message, /timed out/i);
      return true;
    },
  );
});

test("apiRequest forwards external AbortSignal and rejects with NETWORK_ERROR when aborted early", async () => {
  const controller = new AbortController();

  globalThis.fetch = async () => {
    controller.abort();
    throw new DOMException("The operation was aborted.", "AbortError");
  };

  await assert.rejects(
    () => apiRequest("/api/test", { signal: controller.signal }),
    (error: unknown) => {
      assert.ok(error instanceof ApiRequestError);
      assert.equal(error.code, "NETWORK_ERROR");
      return true;
    },
  );
});
