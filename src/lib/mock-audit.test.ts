import assert from "node:assert/strict";
import test, { before } from "node:test";
import type { AuditService } from "./mock-audit";

// mock-audit.ts relies on localStorage which is unavailable in Node.
// Provide a minimal in-memory shim before importing.
const _store: Record<string, string> = {};
const localStorageShim = {
  getItem: (key: string) => _store[key] ?? null,
  setItem: (key: string, value: string) => { _store[key] = value; },
  removeItem: (key: string) => { delete _store[key]; },
  clear: () => { for (const k of Object.keys(_store)) delete _store[k]; },
};
Object.defineProperty(globalThis, "localStorage", {
  value: localStorageShim,
  configurable: true,
});

// navigator.userAgent is used inside logEvent.
Object.defineProperty(globalThis, "navigator", {
  value: { userAgent: "test-agent" },
  configurable: true,
});

let mockAuditService: AuditService;

before(async () => {
  ({ mockAuditService } = await import("./mock-audit.js"));
});

test("logEvent persists an event and returns it", async () => {
  localStorageShim.clear();
  const event = await mockAuditService.logEvent("login", { status: "success" });
  assert.equal(event.eventType, "login");
  assert.ok(event.id.startsWith("evt_"));
  assert.ok(event.timestamp instanceof Date);
});

test("getEvents returns an empty array when nothing is stored", async () => {
  localStorageShim.clear();
  const events = await mockAuditService.getEvents();
  assert.deepEqual(events, []);
});

test("getEvents restores timestamps as Date objects", async () => {
  localStorageShim.clear();
  await mockAuditService.logEvent("signup", { status: "success" });
  const events = await mockAuditService.getEvents();
  assert.ok(events[0].timestamp instanceof Date);
});

test("logEvent caps stored events at 100", async () => {
  localStorageShim.clear();
  for (let i = 0; i < 105; i++) {
    await mockAuditService.logEvent("login");
  }
  const events = await mockAuditService.getEvents();
  assert.ok(events.length <= 100, `expected ≤100 events, got ${events.length}`);
});

test("exportAsCSV returns correct header row", async () => {
  localStorageShim.clear();
  await mockAuditService.logEvent("logout");
  const csv = await mockAuditService.exportAsCSV();
  const firstLine = csv.split("\n")[0];
  assert.ok(firstLine.includes("Event ID"), "missing Event ID header");
  assert.ok(firstLine.includes("Event Type"), "missing Event Type header");
  assert.ok(firstLine.includes("Timestamp"), "missing Timestamp header");
});

test("exportAsCSV includes one data row per event", async () => {
  localStorageShim.clear();
  await mockAuditService.logEvent("login");
  await mockAuditService.logEvent("settings_change", { section: "security" });
  const csv = await mockAuditService.exportAsCSV();
  const lines = csv.trim().split("\n");
  // header + 2 events = 3 lines
  assert.equal(lines.length, 3);
});

test("exportAsCSV wraps all fields in double quotes", async () => {
  localStorageShim.clear();
  await mockAuditService.logEvent("export");
  const csv = await mockAuditService.exportAsCSV();
  const dataRow = csv.split("\n")[1];
  const fields = dataRow.split('","');
  assert.ok(fields.length >= 5, "expected at least 5 quoted fields");
  assert.ok(dataRow.startsWith('"'), "row should start with a quote");
  assert.ok(dataRow.endsWith('"'), "row should end with a quote");
});

test("clearEvents empties the audit log", async () => {
  localStorageShim.clear();
  await mockAuditService.logEvent("transaction");
  await mockAuditService.clearEvents();
  const events = await mockAuditService.getEvents();
  assert.deepEqual(events, []);
});
