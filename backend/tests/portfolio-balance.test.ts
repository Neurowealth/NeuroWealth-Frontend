import { handleOnboarding } from "../src/services/onboarding";
import { _test, User } from "../src/db/userStore";
import { ParsedMessage } from "../src/types/whatsapp";

beforeAll(() => {
  process.env.WALLET_ENCRYPTION_KEY = "ab".repeat(32);
});

beforeEach(() => {
  _test.clear();
  delete process.env.MOCK_VAULT_SHARE_VALUES;
});

function makeMsg(from: string, body: string): ParsedMessage {
  return {
    from,
    message_id: `balance_${Date.now()}`,
    timestamp: Math.floor(Date.now() / 1000),
    text: { body },
    type: "text",
    phone_number_id: "TEST_PHONE_ID",
    display_phone_number: "+1 555 000 0000",
    contact_name: "Portfolio User",
  };
}

function seedUser(partial: Partial<User> & Pick<User, "phone">): User {
  const user: User = {
    id: partial.id || "user_1",
    phone: partial.phone,
    step: partial.step || "active",
    strategy: partial.strategy ?? "balanced",
    pendingStrategy: partial.pendingStrategy ?? null,
    walletAddress: partial.walletAddress ?? "GTESTWALLETADDRESS000000000000000000000000000000000000000001",
    encryptedPrivateKey: partial.encryptedPrivateKey ?? "enc:key",
    totalDeposited: partial.totalDeposited ?? 500,
    depositedAt: partial.depositedAt ?? new Date("2025-01-15T00:00:00.000Z"),
    createdAt: partial.createdAt || new Date("2025-01-15T00:00:00.000Z"),
    updatedAt: partial.updatedAt || new Date("2025-01-15T00:00:00.000Z"),
  };
  _test.seed(user);
  return user;
}

describe("Portfolio balance command", () => {
  test.each([
    "balance",
    "check balance",
    "how much do i have",
    "check my portfolio",
    "portfolio",
    "yield",
    "apy status",
  ])("responds to balance intent variation: %s", async (query) => {
    const user = seedUser({ phone: "2348000000100" });
    process.env.MOCK_VAULT_SHARE_VALUES = JSON.stringify({
      [user.walletAddress as string]: 523.4,
    });

    const reply = await handleOnboarding(makeMsg(user.phone, query));

    expect(reply).toContain("Your NeuroWealth Portfolio");
    expect(reply).toContain("Deposited: 500.00 USDC");
    expect(reply).toContain("Current Value: 523.40 USDC");
    expect(reply).toContain("Yield Earned: +23.40 USDC");
    expect(reply).toContain("Since: Jan 15, 2025");
    expect(reply).toContain("Strategy: Balanced");
    expect(reply).toContain("Current APY: 8.2%");
  });

  test("no-deposit user gets deposit prompt", async () => {
    const user = seedUser({
      phone: "2348000000101",
      totalDeposited: 0,
      depositedAt: null,
    });

    const reply = await handleOnboarding(makeMsg(user.phone, "balance"));

    expect(reply).toContain("don't have an active portfolio yet");
    expect(reply).toContain("Reply DEPOSIT");
  });

  test("mid-onboarding user gets onboarding guidance", async () => {
    const user = seedUser({
      phone: "2348000000102",
      step: "awaiting_confirmation",
      totalDeposited: 0,
      depositedAt: null,
      walletAddress: null,
      encryptedPrivateKey: null,
    });

    const reply = await handleOnboarding(makeMsg(user.phone, "check my value"));

    expect(reply).toContain("one step away from your portfolio");
    expect(reply).toContain("Reply YES");
  });
});
