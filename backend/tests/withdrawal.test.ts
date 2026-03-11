import { handleOnboarding } from "../src/services/onboarding";
import { _test, updateBalance, setUserStep } from "../src/db/userStore";
import { ParsedMessage } from "../src/types/whatsapp";

describe("Withdrawal Flow", () => {
  beforeEach(() => {
    process.env.WALLET_ENCRYPTION_KEY = "ab".repeat(32);
    _test.clear();
  });

  const createMockMessage = (body: string, from = "1234567890"): ParsedMessage => ({
    from,
    message_id: `msg_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    text: { body },
    type: "text",
    phone_number_id: "test_phone_id",
    display_phone_number: "+1234567890",
  });

  const mockReplyCallback = jest.fn();

  it("should initiate withdrawal flow when user types 'withdraw'", async () => {
    // Setup: Create user with balance
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    
    // Set user to active with balance
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    const msg = createMockMessage("withdraw");
    const reply = await handleOnboarding(msg);

    expect(reply).toContain("💸");
    expect(reply).toContain("523.40 USDC");
    expect(reply).toContain("How much would you like to withdraw?");
  });

  it("should handle 'withdraw all' request", async () => {
    // Setup active user with balance
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    // Start withdrawal
    await handleOnboarding(createMockMessage("withdraw"));
    
    // Request all
    const reply = await handleOnboarding(createMockMessage("all"));

    expect(reply).toContain("Confirm withdrawal of");
    expect(reply).toContain("523.40 USDC");
    expect(reply).toContain("CONFIRM");
  });

  it("should handle partial withdrawal with amount", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    await handleOnboarding(createMockMessage("withdraw"));
    const reply = await handleOnboarding(createMockMessage("200"));

    expect(reply).toContain("Confirm withdrawal of");
    expect(reply).toContain("200");
  });

  it("should reject withdrawal below minimum", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    await handleOnboarding(createMockMessage("withdraw"));
    const reply = await handleOnboarding(createMockMessage("5"));

    expect(reply).toContain("Minimum withdrawal is 10 USDC");
  });

  it("should reject withdrawal exceeding balance", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 100);

    await handleOnboarding(createMockMessage("withdraw"));
    const reply = await handleOnboarding(createMockMessage("200"));

    expect(reply).toContain("Insufficient balance");
  });

  it("should handle withdrawal cancellation", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    await handleOnboarding(createMockMessage("withdraw"));
    const reply = await handleOnboarding(createMockMessage("cancel"));

    expect(reply).toContain("Withdrawal cancelled");
  });

  it("should process confirmed withdrawal", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 523.40);

    await handleOnboarding(createMockMessage("withdraw"));
    await handleOnboarding(createMockMessage("200"));
    
    const reply = await handleOnboarding(createMockMessage("confirm"));

    expect(reply).toContain("⏳ Processing withdrawal");
  });

  it("should detect various withdrawal intents", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 100);

    const intents = ["withdraw", "cash out", "take out my money", "withdrawal"];

    for (const intent of intents) {
      await setUserStep("1234567890", "active");
      const reply = await handleOnboarding(createMockMessage(intent));
      expect(reply).toContain("💸");
    }
  });

  it("should prevent withdrawal with zero balance", async () => {
    // Setup
    const msg1 = createMockMessage("hi");
    await handleOnboarding(msg1);
    await handleOnboarding(createMockMessage("balanced"));
    await handleOnboarding(createMockMessage("yes"));
    await setUserStep("1234567890", "active");
    await updateBalance("1234567890", 0);

    const reply = await handleOnboarding(createMockMessage("withdraw"));

    expect(reply).toContain("don't have any funds to withdraw");
    expect(reply).toContain("balance is 0 USDC");
  });
});
