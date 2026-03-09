/**
 * Integration test for history command in onboarding flow
 */

import { handleOnboarding } from "../src/services/onboarding";
import { addTransaction, _test } from "../src/db/userStore";
import { ParsedMessage } from "../src/types/whatsapp";

describe("History Integration", () => {
  beforeEach(() => {
    _test.clear();
    process.env.WALLET_ENCRYPTION_KEY = "ab".repeat(32);
  });

  it("returns empty state for new user", async () => {
    const msg: ParsedMessage = {
      from: "+1234567890",
      message_id: "msg1",
      timestamp: Date.now(),
      text: { body: "history" },
      type: "text",
      phone_number_id: "123",
      display_phone_number: "+15551234567",
    };

    const reply = await handleOnboarding(msg);
    expect(reply).toContain("No transactions yet");
    expect(reply).toContain("DEPOSIT");
  });

  it("returns transaction history for active user", async () => {
    const phone = "+1234567890";
    
    // Onboard user
    const msg1: ParsedMessage = {
      from: phone,
      message_id: "msg1",
      timestamp: Date.now(),
      text: { body: "hi" },
      type: "text",
      phone_number_id: "123",
      display_phone_number: "+15551234567",
    };
    await handleOnboarding(msg1);

    const msg2: ParsedMessage = { ...msg1, message_id: "msg2", text: { body: "balanced" } };
    await handleOnboarding(msg2);

    const msg3: ParsedMessage = { ...msg1, message_id: "msg3", text: { body: "yes" } };
    await handleOnboarding(msg3);

    // Add some transactions
    await addTransaction({
      phone,
      type: "deposit",
      amount: 500,
      strategy: "balanced",
    });

    await addTransaction({
      phone,
      type: "rebalance",
      metadata: {
        fromAPY: 7.1,
        toAPY: 8.4,
        description: "Moved 40% to DEX pool",
      },
    });

    // Mark user as active with balance
    const user = await require("../src/db/userStore").findUserByPhone(phone);
    await require("../src/db/userStore").setUserDeposit(phone, 500);
    await require("../src/db/userStore").updateBalance(phone, 500);

    // Request history
    const historyMsg: ParsedMessage = { ...msg1, message_id: "msg4", text: { body: "history" } };
    const reply = await handleOnboarding(historyMsg);

    expect(reply).toContain("📜 Recent Transactions");
    expect(reply).toContain("🔄 Rebalanced");
    expect(reply).toContain("✅ Deposit");
    expect(reply).toContain("+500");
    expect(reply).toContain("7.1% → 8.4%");
  });

  it("detects various history keywords", async () => {
    const phone = "+1234567890";
    
    // Setup active user
    const msg1: ParsedMessage = {
      from: phone,
      message_id: "msg1",
      timestamp: Date.now(),
      text: { body: "hi" },
      type: "text",
      phone_number_id: "123",
      display_phone_number: "+15551234567",
    };
    await handleOnboarding(msg1);
    await handleOnboarding({ ...msg1, text: { body: "balanced" } });
    await handleOnboarding({ ...msg1, text: { body: "yes" } });
    await require("../src/db/userStore").setUserDeposit(phone, 100);

    const keywords = ["history", "transactions", "what happened", "activity"];
    
    for (const keyword of keywords) {
      const reply = await handleOnboarding({ ...msg1, text: { body: keyword } });
      expect(reply).toContain("📜");
    }
  });
});
