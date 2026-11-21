import { test } from "node:test";
import { strict as assert } from "node:assert";
import { HTTP_STATUS, ERROR_CODE, errorResponse } from "./api-response";

test("HTTP_STATUS includes BAD_GATEWAY 502", () => {
  assert.equal(HTTP_STATUS.BAD_GATEWAY, 502);
});

test("BACKEND_ERROR error code exists", () => {
  assert.equal(ERROR_CODE.BACKEND_ERROR, "BACKEND_ERROR");
});

test("errorResponse with BACKEND_ERROR creates correct structure", () => {
  const response = errorResponse(
    ERROR_CODE.BACKEND_ERROR,
    "Backend service error",
  );

  assert.equal(response.success, false);
  assert.equal(response.error.code, ERROR_CODE.BACKEND_ERROR);
  assert.equal(response.error.message, "Backend service error");
});

test("HTTP_STATUS has correct values for all codes", () => {
  assert.equal(HTTP_STATUS.OK, 200);
  assert.equal(HTTP_STATUS.CREATED, 201);
  assert.equal(HTTP_STATUS.BAD_REQUEST, 400);
  assert.equal(HTTP_STATUS.UNAUTHORIZED, 401);
  assert.equal(HTTP_STATUS.FORBIDDEN, 403);
  assert.equal(HTTP_STATUS.NOT_FOUND, 404);
  assert.equal(HTTP_STATUS.PAYLOAD_TOO_LARGE, 413);
  assert.equal(HTTP_STATUS.TOO_MANY_REQUESTS, 429);
  assert.equal(HTTP_STATUS.INTERNAL_SERVER_ERROR, 500);
  assert.equal(HTTP_STATUS.BAD_GATEWAY, 502);
  assert.equal(HTTP_STATUS.SERVICE_UNAVAILABLE, 503);
});
