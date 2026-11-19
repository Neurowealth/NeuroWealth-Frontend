import test from 'node:test';
import assert from 'node:assert/strict';

import { buildTransactionQuote } from '@/lib/transactions';
import { dictionaries } from '@/lib/i18n/messages';

const tContext = dictionaries.en.transactions.domain;

test('buildTransactionQuote works with proper context', () => {
  const kind = 'deposit' as const;
  const values = {
    amount: '100',
    walletConnected: true,
    walletAddress: '',
  } as any;

  const quote = buildTransactionQuote(kind, values, tContext);

  assert.equal(quote.kind, kind);
  assert.equal(quote.amount, 100);
  assert.ok(typeof quote.fee === 'number');
  assert.ok(typeof quote.netAmount === 'number');
  assert.ok(typeof quote.totalDebit === 'number');
  assert.ok(quote.reference.length > 0);
});
