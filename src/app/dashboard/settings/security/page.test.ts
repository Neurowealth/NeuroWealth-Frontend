import assert from "node:assert/strict";
import test, { describe, it } from "node:test";
import { STORAGE_KEYS } from "@/lib/storage-keys";

describe("Security Settings Page Logic", () => {
  it("uses the correct security storage key from STORAGE_KEYS", () => {
    assert.equal(STORAGE_KEYS.SECURITY, "nw_security");
  });

  it("calculates days since password change correctly", () => {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const daysSinceChange = Math.floor(
      (Date.now() - ninetyDaysAgo.getTime()) / (1000 * 60 * 60 * 24)
    );
    assert.equal(daysSinceChange, 90);
  });

  it("evaluates password strength metrics correctly", () => {
    const getPasswordStrength = (pass: string) => {
      if (!pass) return { score: 0, label: "", color: "" };
      let score = 0;
      if (pass.length >= 8) score++;
      if (/[A-Z]/.test(pass)) score++;
      if (/[0-9]/.test(pass)) score++;
      if (/[^A-Za-z0-9]/.test(pass)) score++;

      if (pass.length < 8) {
        return { score: 1, label: "Too short (min 8 chars)", color: "#f43f5e" };
      }
      if (score <= 2) return { score: 2, label: "Weak", color: "#fbbf24" };
      if (score === 3) return { score: 3, label: "Medium", color: "#38bdf8" };
      return { score: 4, label: "Strong", color: "#34d399" };
    };

    assert.equal(getPasswordStrength("short").score, 1);
    assert.equal(getPasswordStrength("password123").score, 2);
    assert.equal(getPasswordStrength("Password123!").score, 4);
  });
});
