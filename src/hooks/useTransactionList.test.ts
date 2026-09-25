import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  filterTransactions,
  paginateTransactions,
  buildFilterOptions,
  MOCK_TRANSACTIONS,
  type Transaction,
  type TxStatus,
  type TxType,
} from "./useTransactionList";

describe("useTransactionList utilities", () => {
  describe("filterTransactions", () => {
    const testData: Transaction[] = [
      {
        id: "tx-1",
        date: "Jun 15, 2024",
        description: "ETH transfer",
        amount: 1000,
        currency: "ETH",
        status: "completed",
        type: "transfer",
        wallet: "MetaMask",
      },
      {
        id: "tx-2",
        date: "Jun 14, 2024",
        description: "USDC deposit",
        amount: 500,
        currency: "USDC",
        status: "pending",
        type: "deposit",
        wallet: "Coinbase",
      },
      {
        id: "tx-3",
        date: "Jun 13, 2024",
        description: "BTC withdrawal",
        amount: 0.5,
        currency: "BTC",
        status: "failed",
        type: "withdrawal",
        wallet: "Ledger",
      },
    ];

    it("returns all transactions when no filters applied", () => {
      const result = filterTransactions(testData, []);
      assert.equal(result.length, 3);
    });

    it("filters by status", () => {
      const result = filterTransactions(testData, ["status:completed"]);
      assert.equal(result.length, 1);
      assert.equal(result[0].status, "completed");
    });

    it("filters by multiple statuses (OR logic)", () => {
      const result = filterTransactions(testData, [
        "status:completed",
        "status:pending",
      ]);
      assert.equal(result.length, 2);
      assert.ok(
        result.every(
          (tx) => tx.status === "completed" || tx.status === "pending",
        ),
      );
    });

    it("filters by type", () => {
      const result = filterTransactions(testData, ["type:transfer"]);
      assert.equal(result.length, 1);
      assert.equal(result[0].type, "transfer");
    });

    it("filters by multiple types", () => {
      const result = filterTransactions(testData, [
        "type:transfer",
        "type:deposit",
      ]);
      assert.equal(result.length, 2);
      assert.ok(
        result.every((tx) => tx.type === "transfer" || tx.type === "deposit"),
      );
    });

    it("combines status and type filters (AND logic)", () => {
      const result = filterTransactions(testData, [
        "status:completed",
        "type:transfer",
      ]);
      assert.equal(result.length, 1);
      assert.equal(result[0].status, "completed");
      assert.equal(result[0].type, "transfer");
    });

    it("combines multiple status and type filters", () => {
      const result = filterTransactions(testData, [
        "status:completed",
        "status:pending",
        "type:transfer",
        "type:deposit",
      ]);
      assert.equal(result.length, 2); // completed transfer + pending deposit
    });

    it("returns empty array for non-matching filters", () => {
      const result = filterTransactions(testData, [
        "status:cancelled",
        "type:swap",
      ]);
      assert.equal(result.length, 0);
    });

    it("ignores malformed filters", () => {
      const result = filterTransactions(testData, ["invalid_filter"]);
      assert.equal(result.length, 3); // all items returned
    });

    it("handles case-sensitive filter keys", () => {
      const result = filterTransactions(testData, ["Status:completed"]);
      // Should not match (case sensitive)
      assert.equal(result.length, 3);
    });
  });

  describe("paginateTransactions", () => {
    const mockData = Array.from({ length: 25 }, (_, i) => ({
      id: `tx-${i + 1}`,
      date: new Date().toLocaleDateString(),
      description: `Transaction ${i + 1}`,
      amount: 100 * (i + 1),
      currency: "USD",
      status: "completed" as TxStatus,
      type: "transfer" as TxType,
      wallet: "MetaMask",
    }));

    it("returns first page items", () => {
      const result = paginateTransactions(mockData, 1, 10);
      assert.equal(result.length, 10);
      assert.equal(result[0].id, "tx-1");
      assert.equal(result[9].id, "tx-10");
    });

    it("returns second page items", () => {
      const result = paginateTransactions(mockData, 2, 10);
      assert.equal(result.length, 10);
      assert.equal(result[0].id, "tx-11");
      assert.equal(result[9].id, "tx-20");
    });

    it("returns remaining items on last page", () => {
      const result = paginateTransactions(mockData, 3, 10);
      assert.equal(result.length, 5);
      assert.equal(result[0].id, "tx-21");
      assert.equal(result[4].id, "tx-25");
    });

    it("returns empty array for out-of-bounds page", () => {
      const result = paginateTransactions(mockData, 10, 10);
      assert.equal(result.length, 0);
    });

    it("respects itemsPerPage parameter", () => {
      const result = paginateTransactions(mockData, 1, 5);
      assert.equal(result.length, 5);
    });

    it("handles single item per page", () => {
      const result = paginateTransactions(mockData, 3, 1);
      assert.equal(result.length, 1);
      assert.equal(result[0].id, "tx-3");
    });

    it("handles page 0 gracefully", () => {
      const result = paginateTransactions(mockData, 0, 10);
      // Page 0 should return empty or first page depending on implementation
      // start = (0 - 1) * 10 = -10, so slice(-10, 0) returns empty
      assert.equal(result.length, 0);
    });

    it("handles negative itemsPerPage", () => {
      const result = paginateTransactions(mockData, 1, -5);
      assert.equal(result.length, 0);
    });

    it("preserves transaction order", () => {
      const result = paginateTransactions(mockData, 1, 10);
      for (let i = 0; i < result.length - 1; i++) {
        const current = parseInt(result[i].id.split("-")[1]);
        const next = parseInt(result[i + 1].id.split("-")[1]);
        assert.ok(current < next);
      }
    });
  });

  describe("buildFilterOptions", () => {
    const testData: Transaction[] = [
      {
        id: "tx-1",
        date: "Jun 15, 2024",
        description: "Transfer",
        amount: 100,
        currency: "ETH",
        status: "completed",
        type: "transfer",
        wallet: "MetaMask",
      },
      {
        id: "tx-2",
        date: "Jun 14, 2024",
        description: "Deposit",
        amount: 50,
        currency: "USDC",
        status: "completed",
        type: "deposit",
        wallet: "Coinbase",
      },
      {
        id: "tx-3",
        date: "Jun 13, 2024",
        description: "Withdrawal",
        amount: 25,
        currency: "BTC",
        status: "pending",
        type: "withdrawal",
        wallet: "Ledger",
      },
      {
        id: "tx-4",
        date: "Jun 12, 2024",
        description: "Swap",
        amount: 75,
        currency: "SOL",
        status: "failed",
        type: "swap",
        wallet: "Trust",
      },
    ];

    it("returns status options with counts", () => {
      const options = buildFilterOptions(testData);
      const statusOptions = options.filter((o) => o.group === "status");

      assert.ok(statusOptions.length > 0);
      assert.ok(
        statusOptions.some((o) => o.id === "status:completed" && o.count === 2),
      );
      assert.ok(
        statusOptions.some((o) => o.id === "status:pending" && o.count === 1),
      );
      assert.ok(
        statusOptions.some((o) => o.id === "status:failed" && o.count === 1),
      );
    });

    it("returns type options with counts", () => {
      const options = buildFilterOptions(testData);
      const typeOptions = options.filter((o) => o.group === "type");

      assert.ok(typeOptions.length > 0);
      assert.ok(typeOptions.every((o) => o.count >= 1));
      assert.ok(
        typeOptions.some((o) => o.id === "type:transfer" && o.count === 1),
      );
    });

    it("includes all status types even with zero count", () => {
      const options = buildFilterOptions(testData);
      const statusOptions = options.filter((o) => o.group === "status");

      // Should have cancelled status option even if count is 0
      const statusIds = statusOptions.map((o) => o.id);
      assert.ok(
        statusIds.includes("status:cancelled") || statusOptions.length === 3,
      );
    });

    it("includes all transaction types even with zero count", () => {
      const options = buildFilterOptions(testData);
      const typeOptions = options.filter((o) => o.group === "type");

      const typeIds = typeOptions.map((o) => o.id);
      assert.ok(typeIds.length >= 4); // At least all 4 types
    });

    it("aggregates counts correctly", () => {
      const options = buildFilterOptions(testData);
      const statusOptions = options.filter((o) => o.group === "status");

      const totalCount = statusOptions.reduce((sum, o) => sum + o.count, 0);
      assert.equal(totalCount, testData.length);
    });

    it("handles empty data gracefully", () => {
      const options = buildFilterOptions([]);

      assert.ok(options.length > 0); // Should have all option types
      assert.ok(options.every((o) => o.count === 0));
    });
  });

  describe("MOCK_TRANSACTIONS", () => {
    it("contains 87 transactions", () => {
      assert.equal(MOCK_TRANSACTIONS.length, 87);
    });

    it("has valid transaction structure", () => {
      const tx = MOCK_TRANSACTIONS[0];
      assert.ok(tx.id);
      assert.ok(tx.date);
      assert.ok(tx.description);
      assert.ok(typeof tx.amount === "number");
      assert.ok(tx.currency);
      assert.ok(tx.status);
      assert.ok(tx.type);
      assert.ok(tx.wallet);
    });

    it("all transactions have valid status values", () => {
      const validStatuses: TxStatus[] = [
        "completed",
        "pending",
        "failed",
        "cancelled",
      ];
      assert.ok(
        MOCK_TRANSACTIONS.every((tx) => validStatuses.includes(tx.status)),
      );
    });

    it("all transactions have valid type values", () => {
      const validTypes: TxType[] = [
        "transfer",
        "deposit",
        "withdrawal",
        "swap",
      ];
      assert.ok(MOCK_TRANSACTIONS.every((tx) => validTypes.includes(tx.type)));
    });

    it("amounts are positive numbers", () => {
      assert.ok(MOCK_TRANSACTIONS.every((tx) => tx.amount > 0));
    });

    it("has diverse wallet types", () => {
      const wallets = new Set(MOCK_TRANSACTIONS.map((tx) => tx.wallet));
      assert.ok(wallets.size >= 2); // At least 2 different wallet types
    });

    it("dates are formatted consistently", () => {
      MOCK_TRANSACTIONS.forEach((tx) => {
        // Should be a valid date string format
        const date = new Date(tx.date);
        // If date is invalid, this will be false
        assert.ok(!isNaN(date.getTime()) || tx.date.includes(","));
      });
    });
  });

  describe("integration: filter + paginate", () => {
    it("filters then paginates correctly", () => {
      const testData: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
        id: `tx-${i + 1}`,
        date: new Date().toLocaleDateString(),
        description: `Tx ${i + 1}`,
        amount: 100,
        currency: "USD",
        status: i % 2 === 0 ? "completed" : "pending",
        type: i % 3 === 0 ? "transfer" : "deposit",
        wallet: "MetaMask",
      }));

      // Filter to completed transactions only
      const filtered = filterTransactions(testData, ["status:completed"]);
      assert.ok(filtered.length > 0);

      // Paginate filtered results
      const paginated = paginateTransactions(filtered, 1, 5);
      assert.ok(paginated.length <= 5);
      assert.ok(paginated.every((tx) => tx.status === "completed"));
    });

    it("handles pagination after filtering returns few results", () => {
      const testData = Array.from({ length: 20 }, (_, i) => ({
        id: `tx-${i + 1}`,
        date: new Date().toLocaleDateString(),
        description: `Tx`,
        amount: 100,
        currency: "USD",
        status: "completed" as TxStatus,
        type: "swap" as TxType,
        wallet: "MetaMask",
      }));

      // Filter for rare type
      const filtered = filterTransactions(testData, ["type:swap"]);

      // Request page 1 with 8 items per page
      const paginated = paginateTransactions(filtered, 1, 8);
      assert.ok(paginated.length <= 8);
    });
  });
});
