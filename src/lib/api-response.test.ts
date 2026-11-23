import assert from "node:assert/strict";
import test from "node:test";

import { ERROR_CODE, HTTP_STATUS, MAX_BODY_BYTES, readJsonBody } from "./api-response";

function makeJsonRequest(body: string, headers?: HeadersInit): Request {
  return new Request("http://localhost:3000/api/test", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body,
  });
}

test("readJsonBody parses valid JSON within the configured size limit", async () => {
  const result = await readJsonBody(makeJsonRequest('{"ok":true}'));

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.data, { ok: true });
  }
});

test("readJsonBody rejects missing and non-JSON content types before reading the body", async () => {
  for (const headers of [{ "Content-Type": "text/plain" }, {}]) {
    let bodyRead = false;
    const request = new Request("http://localhost:3000/api/test", {
      method: "POST",
      headers,
      body: new ReadableStream({
        pull() {
          bodyRead = true;
        },
      }, { highWaterMark: 0 }),
      duplex: "half",
    } as RequestInit);

    const result = await readJsonBody(request);

    assert.equal(bodyRead, false);
    assert.equal(result.ok, false);
    if (!result.ok) {
      const body = await result.response.json();
      assert.equal(result.response.status, HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE);
      assert.equal(body.success, false);
      assert.equal(body.error.code, ERROR_CODE.UNSUPPORTED_MEDIA_TYPE);
    }
  }
});

test("readJsonBody accepts JSON media types with parameters and structured suffixes", async () => {
  const result = await readJsonBody(
    makeJsonRequest('{"ok":true}', {
      "Content-Type": "application/problem+json; charset=utf-8",
    }),
  );

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.deepEqual(result.data, { ok: true });
  }
});

test("readJsonBody rejects declared oversized bodies before parsing", async () => {
  const result = await readJsonBody(
    makeJsonRequest("{}", {
      "Content-Length": String(MAX_BODY_BYTES + 1),
    }),
  );

  assert.equal(result.ok, false);
  if (!result.ok) {
    const body = await result.response.json();
    assert.equal(result.response.status, HTTP_STATUS.PAYLOAD_TOO_LARGE);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.PAYLOAD_TOO_LARGE);
  }
});

test("readJsonBody rejects streamed bodies that exceed the configured limit", async () => {
  const oversizedBody = JSON.stringify({ value: "x".repeat(MAX_BODY_BYTES) });
  const result = await readJsonBody(makeJsonRequest(oversizedBody));

  assert.equal(result.ok, false);
  if (!result.ok) {
    const body = await result.response.json();
    assert.equal(result.response.status, HTTP_STATUS.PAYLOAD_TOO_LARGE);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.PAYLOAD_TOO_LARGE);
  }
});

test("readJsonBody returns a 400 envelope for malformed JSON", async () => {
  const result = await readJsonBody(makeJsonRequest("not-json"));

  assert.equal(result.ok, false);
  if (!result.ok) {
    const body = await result.response.json();
    assert.equal(result.response.status, HTTP_STATUS.BAD_REQUEST);
    assert.equal(body.success, false);
    assert.equal(body.error.code, ERROR_CODE.VALIDATION_ERROR);
    assert.deepEqual(body.error.details, {
      body: ["Malformed JSON payload."],
    });
  }
});
