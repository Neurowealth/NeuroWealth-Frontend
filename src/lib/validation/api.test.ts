import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";
import {
  buildValidationDetails,
  transactionFormValuesSchema,
  zodErrorToDetails,
} from "./api";

test("buildValidationDetails formats paths correctly", () => {
  assert.deepEqual(buildValidationDetails(["user", "email"], "Invalid"), ["user.email", "Invalid"]);
  assert.deepEqual(buildValidationDetails([], "Global error"), ["form", "Global error"]);
  assert.deepEqual(buildValidationDetails([0, "name"], "Required"), ["0.name", "Required"]);
  assert.deepEqual(buildValidationDetails([Symbol.for("test")], "Error"), ["Symbol(test)", "Error"]);
});

test("zodErrorToDetails groups issues by path", () => {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Must be at least 18"),
    contact: z.object({
      email: z.string().email("Invalid email")
    }).optional()
  });

  const result = schema.safeParse({ name: "", age: 10, contact: { email: "bad" } });
  
  if (result.success) {
    assert.fail("Should have failed validation");
  }

  const details = zodErrorToDetails(result.error);
  
  assert.deepEqual(details, {
    "name": ["Name is required"],
    "age": ["Must be at least 18"],
    "contact.email": ["Invalid email"]
  });
});

test("zodErrorToDetails groups multiple issues on the same path", () => {
  const schema = z.object({
    password: z.string().min(8, "Too short").regex(/[A-Z]/, "Needs uppercase")
  });

  const result = schema.safeParse({ password: "pass" });
  
  if (result.success) {
    assert.fail("Should have failed validation");
  }

  const details = zodErrorToDetails(result.error);
  
  assert.deepEqual(details, {
    "password": ["Too short", "Needs uppercase"]
  });
});

test("transactionFormValuesSchema rejects oversized amount and walletAddress", () => {
  const oversizedAmount = transactionFormValuesSchema.safeParse({
    amount: "1".repeat(33),
    walletAddress: "G".repeat(56),
    walletConnected: true,
  });
  assert.equal(oversizedAmount.success, false);

  const oversizedWalletAddress = transactionFormValuesSchema.safeParse({
    amount: "100",
    walletAddress: "G".repeat(57),
    walletConnected: true,
  });
  assert.equal(oversizedWalletAddress.success, false);

  const withinBounds = transactionFormValuesSchema.safeParse({
    amount: "100",
    walletAddress: "G".repeat(56),
    walletConnected: true,
  });
  assert.equal(withinBounds.success, true);
});
