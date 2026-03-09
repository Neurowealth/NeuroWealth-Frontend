/**
 * Transaction history tests
 */

import { addTransaction, getTransactionHistory, _test } from "../src/db/userStore";
import { buildHistoryReply, isHistoryIntent } from "../src/services/history";

describe("Transaction History", () => {
  beforeEach(() => {
    _test.clear();
  });

  describe("isHistoryIntent", () => {
    it("detects history keywords", () => {
      expect(isHistoryIntent("history")).toBe(true);
      expect(isHistoryIntent("HISTORY")).toBe(true);
      expect(isHistoryIntent("transactions")).toBe(true);
      expect(isHistoryIntent("what happened")).toBe(true);
      expect(isHistoryIntent("show me my activity")).toBe(true);
      expect(isHistoryIntent("show event")).toBe(true);
    });

    it("rejects non-history messages", () => {
      expect(isHistoryIntent("balance")).toBe(false);
      expect(isHistoryIntent("withdraw")).toBe(false);
      expect(isHistoryIntent("hello")).toBe(false);
    });
  });

  describe("Transaction storage", () => {
    it("stores and retrieves transactions", async () => {
      await addTransaction({
        phone: "+1234567890",
        type: "deposit",
        amount: 500,
        strategy: "balanced",
      });

      const history = await getTransactionHistory("+1234567890");
      expect(history).toHaveLength(1);
      expect(history[0].type).toBe("deposit");
      expect(history[0].amount).toBe(500);
    });

    it("limits results to specified count", async () => {
      const phone = "+1234567890";
      
      for (let i = 0; i < 10; i++) {
        await addTransaction({
          phone,
          type: "deposit",
          amount: 100 * i,
          strategy: "balanced",
        });
      }

      const history = await getTransactionHistory(phone, 5);
      expect(history).toHaveLength(5);
    });

    it("returns most recent transactions first", async () => {
      const phone = "+1234567890";
      
      await addTransaction({ phone, type: "deposit", amount: 100, strategy: "balanced" });
      await new Promise(resolve => setTimeout(resolve, 10));
      await addTransaction({ phone, type: "withdrawal", amount: 50 });
      
      const history = await getTransactionHistory(phone);
      expect(history[0].type).toBe("withdrawal");
      expect(history[1].type).toBe("deposit");
    });
  });

  describe("buildHistoryReply", () => {
    it("handles empty history", async () => {
      const user = {
        id: "1",
        phone: "+1234567890",
        step: "active" as const,
        strategy: "balanced" as const,
        walletAddress: "GABC123",
        encryptedPrivateKey: "encrypted",
        balance: 100,
        totalDeposited: 100,
        depositedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reply = await buildHistoryReply(user);
      expect(reply).toContain("No transactions yet");
      expect(reply).toContain("DEPOSIT");
    });

    it("formats deposit transactions", async () => {
      const phone = "+1234567890";
      await addTransaction({
        phone,
        type: "deposit",
        amount: 500,
        strategy: "balanced",
      });

      const user = {
        id: "1",
        phone,
        step: "active" as const,
        strategy: "balanced" as const,
        walletAddress: "GABC123",
        encryptedPrivateKey: "encrypted",
        balance: 500,
        totalDeposited: 500,
        depositedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reply = await buildHistoryReply(user);
      expect(reply).toContain("✅ Deposit");
      expect(reply).toContain("+500");
      expect(reply).toContain("Balanced");
    });

    it("formats withdrawal transactions with Stellar Expert link", async () => {
      const phone = "+1234567890";
      await addTransaction({
        phone,
        type: "withdrawal",
        amount: 100,
        txHash: "ABC123XYZ",
        metadata: {
          walletAddress: "GABC123XYZ456",
        },
      });

      const user = {
        id: "1",
        phone,
        step: "active" as const,
        strategy: "balanced" as const,
        walletAddress: "GABC123",
        encryptedPrivateKey: "encrypted",
        balance: 400,
        totalDeposited: 500,
        depositedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reply = await buildHistoryReply(user);
      expect(reply).toContain("💸 Withdrawal");
      expect(reply).toContain("-100");
      expect(reply).toContain("GABC...456");
      expect(reply).toContain("stellar.expert");
    });

    it("formats rebalance transactions", async () => {
      const phone = "+1234567890";
      await addTransaction({
        phone,
        type: "rebalance",
        metadata: {
          fromAPY: 7.1,
          toAPY: 8.4,
          description: "Moved 40% to DEX pool",
        },
      });

      const user = {
        id: "1",
        phone,
        step: "active" as const,
        strategy: "balanced" as const,
        walletAddress: "GABC123",
        encryptedPrivateKey: "encrypted",
        balance: 500,
        totalDeposited: 500,
        depositedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reply = await buildHistoryReply(user);
      expect(reply).toContain("🔄 Rebalanced");
      expect(reply).toContain("7.1% → 8.4%");
      expect(reply).toContain("Moved 40% to DEX pool");
    });

    it("shows correct count message", async () => {
      const phone = "+1234567890";
      
      await addTransaction({ phone, type: "deposit", amount: 100, strategy: "balanced" });
      await addTransaction({ phone, type: "deposit", amount: 200, strategy: "balanced" });
      await addTransaction({ phone, type: "withdrawal", amount: 50 });

      const user = {
        id: "1",
        phone,
        step: "active" as const,
        strategy: "balanced" as const,
        walletAddress: "GABC123",
        encryptedPrivateKey: "encrypted",
        balance: 250,
        totalDeposited: 300,
        depositedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reply = await buildHistoryReply(user);
      expect(reply).toContain("Showing last 3 events");
    });
  });
});
