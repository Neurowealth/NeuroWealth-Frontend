#!/usr/bin/env node

/**
 * Demo script to test withdrawal flow
 * Run: node demo-withdrawal.js
 */

const { handleOnboarding } = require('./dist/services/onboarding');
const { updateBalance, setUserStep, _test } = require('./dist/db/userStore');

const createMessage = (body, from = '1234567890') => ({
  from,
  message_id: `msg_${Date.now()}`,
  timestamp: Math.floor(Date.now() / 1000),
  text: { body },
  type: 'text',
  phone_number_id: 'demo_phone',
  display_phone_number: '+1234567890',
});

const mockReply = async (to, phoneId, text) => {
  console.log(`\n📱 Bot → User (${to}):`);
  console.log(text);
  console.log('─'.repeat(60));
};

async function demo() {
  console.log('🚀 NeuroWealth Withdrawal Flow Demo\n');
  console.log('═'.repeat(60));

  // Clear any existing data
  _test.clear();

  // Step 1: Onboarding
  console.log('\n👤 User: hi');
  let reply = await handleOnboarding(createMessage('hi'), mockReply);
  console.log(`\n📱 Bot: ${reply?.substring(0, 100)}...`);

  console.log('\n👤 User: balanced');
  reply = await handleOnboarding(createMessage('balanced'), mockReply);
  console.log(`\n📱 Bot: ${reply?.substring(0, 100)}...`);

  console.log('\n👤 User: yes');
  reply = await handleOnboarding(createMessage('yes'), mockReply);
  console.log(`\n📱 Bot: ${reply?.substring(0, 100)}...`);

  // Step 2: Simulate active user with balance
  console.log('\n\n🔧 [System: Setting user to active with 523.40 USDC balance]');
  await setUserStep('1234567890', 'active');
  await updateBalance('1234567890', 523.40);

  // Step 3: Withdrawal flow
  console.log('\n\n═'.repeat(60));
  console.log('💸 WITHDRAWAL FLOW');
  console.log('═'.repeat(60));

  console.log('\n👤 User: withdraw');
  reply = await handleOnboarding(createMessage('withdraw'), mockReply);
  console.log(`\n📱 Bot:\n${reply}`);

  console.log('\n\n👤 User: 200');
  reply = await handleOnboarding(createMessage('200'), mockReply);
  console.log(`\n📱 Bot:\n${reply}`);

  console.log('\n\n👤 User: confirm');
  reply = await handleOnboarding(createMessage('confirm'), mockReply);
  console.log(`\n📱 Bot:\n${reply}`);

  console.log('\n\n⏳ [Waiting 10 seconds for blockchain confirmation...]');
  
  // Wait for async withdrawal to complete
  await new Promise(resolve => setTimeout(resolve, 11000));

  console.log('\n\n✅ Demo complete!');
  console.log('\nTry these variations:');
  console.log('  • "withdraw" → "all" → "confirm" (full withdrawal)');
  console.log('  • "withdraw" → "5" (below minimum)');
  console.log('  • "withdraw" → "1000" (exceeds balance)');
  console.log('  • "withdraw" → "cancel" (cancellation)');
  
  process.exit(0);
}

demo().catch(err => {
  console.error('❌ Demo failed:', err);
  process.exit(1);
});
