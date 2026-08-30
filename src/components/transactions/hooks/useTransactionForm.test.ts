import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { renderHook, act } from "@/test-utils/render-hook";
import { useTransactionForm } from "./useTransactionForm";
import { TransactionKind } from "@/lib/transactions";

describe("useTransactionForm", () => {
  describe("updateField", () => {
    it("updates a single field value", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.updateField("amount", "100");
      });

      assert.equal(result.current.formValues.amount, "100");
    });

    it("clears the field error when updating that field", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({ amount: "Amount is required" });
      });

      assert.equal(result.current.fieldErrors.amount, "Amount is required");

      act(() => {
        result.current.updateField("amount", "100");
      });

      assert.equal(result.current.fieldErrors.amount, undefined);
    });

    it("clears the form-level error when updating any field", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({ form: "Form validation failed" });
      });

      assert.equal(result.current.fieldErrors.form, "Form validation failed");

      act(() => {
        result.current.updateField("amount", "100");
      });

      assert.equal(result.current.fieldErrors.form, undefined);
    });

    it("does not clear other field errors when updating a different field", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({
          amount: "Amount error",
          walletAddress: "Address error"
        });
      });

      act(() => {
        result.current.updateField("amount", "100");
      });

      assert.equal(result.current.fieldErrors.amount, undefined);
      assert.equal(result.current.fieldErrors.walletAddress, "Address error");
    });

    it("only clears the field error and form error, not other fields", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({
          form: "Form error",
          amount: "Amount error",
          walletAddress: "Address error",
        });
      });

      act(() => {
        result.current.updateField("amount", "100");
      });

      assert.equal(result.current.fieldErrors.amount, undefined);
      assert.equal(result.current.fieldErrors.form, undefined);
      assert.equal(result.current.fieldErrors.walletAddress, "Address error");
    });
  });

  describe("validate", () => {
    it("returns true when no validation errors", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.updateField("amount", "100");
        result.current.updateField("walletAddress", "GBXYZ...");
      });

      let isValid = false;
      act(() => {
        isValid = result.current.validate();
      });

      assert.equal(isValid, true);
      assert.deepEqual(result.current.fieldErrors, {});
    });

    it("returns false and sets errors when validation fails", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      let isValid = false;
      act(() => {
        isValid = result.current.validate();
      });

      assert.equal(isValid, false);
      assert.ok(Object.keys(result.current.fieldErrors).length > 0);
    });

    it("sets individual field errors on validation failure", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.validate();
      });

      // Should have error(s) for missing/invalid required fields
      assert.ok(result.current.fieldErrors.amount !== undefined ||
                result.current.fieldErrors.walletAddress !== undefined);
    });

    it("clears previous errors before validating", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      // Set some initial errors
      act(() => {
        result.current.setErrors({ amount: "Old error" });
      });

      // Provide valid data
      act(() => {
        result.current.updateField("amount", "100");
        result.current.updateField("walletAddress", "GBXYZ...");
      });

      act(() => {
        result.current.validate();
      });

      // Old errors should be cleared
      assert.equal(result.current.fieldErrors.amount, undefined);
    });
  });

  describe("reset", () => {
    it("resets form to default values", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.updateField("amount", "100");
        result.current.setErrors({ amount: "Some error" });
      });

      act(() => {
        result.current.reset();
      });

      // Should return to defaults
      const initial = result.current.formValues;
      assert.equal(initial.amount, "" || initial.amount === undefined || typeof initial.amount === "number");
      assert.deepEqual(result.current.fieldErrors, {});
    });
  });

  describe("setErrors", () => {
    it("sets field errors directly", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({
          amount: "Invalid amount",
          walletAddress: "Invalid address",
        });
      });

      assert.equal(result.current.fieldErrors.amount, "Invalid amount");
      assert.equal(result.current.fieldErrors.walletAddress, "Invalid address");
    });

    it("can set form-level errors", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      act(() => {
        result.current.setErrors({ form: "Network error occurred" });
      });

      assert.equal(result.current.fieldErrors.form, "Network error occurred");
    });
  });

  describe("setValues", () => {
    it("sets form values from snapshot", () => {
      const { result } = renderHook(() => useTransactionForm("deposit" as TransactionKind));

      const snapshotValues = {
        ...result.current.formValues,
        amount: "250",
        walletAddress: "GABC123...",
      };

      act(() => {
        result.current.setValues(snapshotValues);
      });

      assert.equal(result.current.formValues.amount, "250");
      assert.equal(result.current.formValues.walletAddress, "GABC123...");
    });
  });
});
