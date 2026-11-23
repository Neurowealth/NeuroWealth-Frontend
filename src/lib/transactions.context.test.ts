import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildPendingTransaction,
  buildPreviewSnapshot,
  buildTransactionQuote,
  getTransactionContext,
} from '@/lib/transactions';
import { dictionaries } from '@/lib/i18n/messages';

// Real i18n domain for English
const tDomain = dictionaries.en.transactions.domain;

const kind = 'deposit' as const;
const values = {
  amount: '100',
  walletConnected: true,
  walletAddress: '',
} as any;

test('buildTransactionQuote returns a fully populated quote using real i18n context', () => {
  const quote = buildTransactionQuote(kind, values, tDomain.context);

  // Basic numeric fields
  assert.equal(quote.kind, kind);
  assert.equal(quote.amount, 100);
  assert.equal(typeof quote.fee, 'number');
  assert.equal(typeof quote.netAmount, 'number');
  assert.equal(typeof quote.totalDebit, 'number');
  assert.ok(quote.reference.length > 0);

  // Fields derived from the translation context. tDomain.context is the raw
  // i18n dictionary shape (e.g. fundingWallet/sameDay) — getTransactionContext
  // maps it to the TransactionContext shape (walletLabel/strategyLabel/
  // settlementLabel) that buildTransactionQuote actually reads from.
  const mappedContext = getTransactionContext(kind, tDomain.context);
  assert.equal(quote.walletLabel, mappedContext.walletLabel);
  assert.equal(quote.strategyLabel, mappedContext.strategyLabel);
  assert.equal(quote.estimatedSettlement, mappedContext.settlementLabel);
});

test('buildPendingTransaction creates a pending transaction that mirrors the quote and uses i18n pending messages', () => {
  const pending = buildPendingTransaction(
    kind,
    values,
    tDomain.pending,
    tDomain.context,
  );

  // The reference should match pending's own embedded quote — not a second,
  // independently-generated quote, which would have a different random
  // reference since generateReference() includes a random suffix.
  assert.equal(pending.reference, pending.quote.reference);

  // Validate i18n‑derived fields on the pending object
  assert.equal(pending.statusLabel, tDomain.pending.statusLabel);
  assert.equal(pending.message, tDomain.pending.submittingDeposit);
  assert.equal(pending.nextStatus, 'success');
  assert.ok(pending.completionDelayMs > 0);
  assert.ok(pending.quote);
});

test('getTransactionContext and quote builders propagate the selected strategy label across confirm, pending, and receipt', () => {
  const depositContext = getTransactionContext('deposit', tDomain.context, 'Conservative');
  const withdrawalContext = getTransactionContext('withdrawal', tDomain.context, 'Growth');
  assert.equal(depositContext.strategyLabel, 'Conservative');
  assert.equal(withdrawalContext.strategyLabel, 'Growth');

  // Blank or omitted values fall back to Balanced
  assert.equal(getTransactionContext('deposit', tDomain.context, '   ').strategyLabel, 'Balanced');

  const depositQuote = buildTransactionQuote('deposit', values, tDomain.context, undefined, 'Conservative');
  assert.equal(depositQuote.strategyLabel, 'Conservative');

  const withdrawalQuote = buildTransactionQuote('withdrawal', values, tDomain.context, 'NW-WDR-CUSTOM', 'Growth');
  assert.equal(withdrawalQuote.reference, 'NW-WDR-CUSTOM');
  assert.equal(withdrawalQuote.strategyLabel, 'Growth');

  const pending = buildPendingTransaction('deposit', values, tDomain.pending, tDomain.context, 'success', 'Conservative');
  assert.equal(pending.quote.strategyLabel, 'Conservative');

  const confirmPreview = buildPreviewSnapshot('deposit', 'confirm', tDomain, 'Conservative');
  assert.equal(confirmPreview.quote?.strategyLabel, 'Conservative');

  const pendingPreview = buildPreviewSnapshot('withdrawal', 'pending', tDomain, 'Growth');
  assert.equal(pendingPreview.pending?.quote.strategyLabel, 'Growth');

  const successPreview = buildPreviewSnapshot('deposit', 'success', tDomain, 'Conservative');
  assert.equal(successPreview.receipt?.quote.strategyLabel, 'Conservative');
});
