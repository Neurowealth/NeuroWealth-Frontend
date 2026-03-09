/**
 * Demo script to showcase transaction history feature
 * Run: npm run build && node backend/demo-history.js
 */

const { addTransaction, getTransactionHistory, _test } = require("./dist/db/userStore");
const { buildHistoryReply } = require("./dist/services/history");

async function demo() {
  console.log("🧪 NeuroWealth Transaction History Demo\n");

  _test.clear();

  const phone = "+15551234567";
  const user = {
    id: "demo-user",
    phone,
    step: "active",
    strategy: "balanced",
    walletAddress: "GABC123XYZ456DEF789",
    encryptedPrivateKey: "encrypted",
    balance: 650,
    totalDeposited: 700,
    depositedAt: new Date("2026-01-15"),
    createdAt: new Date("2026-01-15"),
    updatedAt: new Date(),
  };

  // Simulate transaction history
  await addTransaction({
    phone,
    type: "deposit",
    amount: 500,
    strategy: "balanced",
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await addTransaction({
    phone,
    type: "rebalance",
    metadata: {
      fromAPY: 7.1,
      toAPY: 8.4,
      description: "Moved 40% to DEX pool",
    },
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await addTransaction({
    phone,
    type: "withdrawal",
    amount: 100,
    txHash: "ABC123XYZ789DEF456",
    metadata: {
      walletAddress: "GABC123XYZ456DEF789",
    },
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await addTransaction({
    phone,
    type: "deposit",
    amount: 200,
    strategy: "balanced",
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  await addTransaction({
    phone,
    type: "rebalance",
    metadata: {
      fromAPY: 7.8,
      toAPY: 9.1,
      description: "Moved back to Blend",
    },
  });

  console.log("📱 User sends: 'history'\n");
  const reply = await buildHistoryReply(user);
  console.log("🤖 Bot replies:\n");
  console.log(reply);
  console.log("\n✅ Demo complete!");
}

demo().catch(console.error);
