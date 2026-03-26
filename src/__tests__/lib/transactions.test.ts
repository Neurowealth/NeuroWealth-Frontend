import { describe, it, expect } from 'vitest';
import {
    validateTransactionValues,
    buildTransactionQuote,
    buildPendingTransaction,
    buildTransactionReceipt,
    parseTransactionKind,
    getTransactionContext,
    TransactionKind,
    TransactionFormValues,
} from '@/lib/transactions';

describe('Transaction Utilities', () => {
    describe('parseTransactionKind', () => {
        it('should parse withdrawal', () => {
            expect(parseTransactionKind('withdrawal')).toBe('withdrawal');
        });

        it('should default to deposit', () => {
            expect(parseTransactionKind('deposit')).toBe('deposit');
            expect(parseTransactionKind(null)).toBe('deposit');
            expect(parseTransactionKind('invalid')).toBe('deposit');
        });
    });

    describe('getTransactionContext', () => {
        it('should return deposit context', () => {
            const context = getTransactionContext('deposit');
            expect(context.kind).toBe('deposit');
            expect(context.title).toBe('Add capital');
            expect(context.minAmount).toBe(10);
            expect(context.fee).toBe(0.06);
        });

        it('should return withdrawal context', () => {
            const context = getTransactionContext('withdrawal');
            expect(context.kind).toBe('withdrawal');
            expect(context.title).toBe('Withdraw funds');
            expect(context.minAmount).toBe(10);
            expect(context.fee).toBe(0.38);
        });
    });

    describe('validateTransactionValues', () => {
        const validDepositValues: TransactionFormValues = {
            amount: '100',
            walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
            walletConnected: true,
        };

        const validWithdrawalValues: TransactionFormValues = {
            amount: '100',
            walletAddress: 'GCFXJ4K7R2UTJHI4B74ZLGIBSAWZSA3O76UR3X5IYK6YG33BZINM2F3B',
            walletConnected: true,
        };

        it('should validate valid deposit', () => {
            const errors = validateTransactionValues('deposit', validDepositValues);
            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should validate valid withdrawal', () => {
            const errors = validateTransactionValues('withdrawal', validWithdrawalValues);
            expect(Object.keys(errors)).toHaveLength(0);
        });

        it('should reject deposit without wallet connection', () => {
            const values = { ...validDepositValues, walletConnected: false };
            const errors = validateTransactionValues('deposit', values);
            expect(errors.walletConnected).toBeDefined();
        });

        it('should reject empty amount', () => {
            const values = { ...validDepositValues, amount: '' };
            const errors = validateTransactionValues('deposit', values);
            expect(errors.amount).toBeDefined();
        });

        it('should reject amount below minimum', () => {
            const values = { ...validDepositValues, amount: '5' };
            const errors = validateTransactionValues('deposit', values);
            expect(errors.amount).toContain('Minimum');
        });

        it('should reject amount above available', () => {
            const values = { ...validDepositValues, amount: '99999' };
            const errors = validateTransactionValues('deposit', values);
            expect(errors.amount).toContain('available');
        });

        it('should reject invalid Stellar address for withdrawal', () => {
            const values = { ...validWithdrawalValues, walletAddress: 'INVALID' };
            const errors = validateTransactionValues('withdrawal', values);
            expect(errors.walletAddress).toBeDefined();
        });

        it('should reject missing wallet address for withdrawal', () => {
            const values = { ...validWithdrawalValues, walletAddress: '' };
            const errors = validateTransactionValues('withdrawal', values);
            expect(errors.walletAddress).toBeDefined();
        });
    });

    describe('buildTransactionQuote', () => {
        it('should build deposit quote', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                walletConnected: true,
            };

            const quote = buildTransactionQuote('deposit', values);

            expect(quote.kind).toBe('deposit');
            expect(quote.amount).toBe(100);
            expect(quote.fee).toBe(0.06);
            expect(quote.totalDebit).toBe(100.06);
            expect(quote.netAmount).toBe(100);
            expect(quote.reference).toMatch(/^NW-DEP-/);
        });

        it('should build withdrawal quote', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GCFXJ4K7R2UTJHI4B74ZLGIBSAWZSA3O76UR3X5IYK6YG33BZINM2F3B',
                walletConnected: true,
            };

            const quote = buildTransactionQuote('withdrawal', values);

            expect(quote.kind).toBe('withdrawal');
            expect(quote.amount).toBe(100);
            expect(quote.fee).toBe(0.38);
            expect(quote.totalDebit).toBe(100);
            expect(quote.netAmount).toBe(99.62);
            expect(quote.reference).toMatch(/^NW-WDR-/);
        });
    });

    describe('buildPendingTransaction', () => {
        it('should build pending transaction', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                walletConnected: true,
            };

            const pending = buildPendingTransaction('deposit', values, 'success');

            expect(pending.kind).toBe('deposit');
            expect(pending.nextStatus).toBe('success');
            expect(pending.completionDelayMs).toBe(1600);
            expect(pending.failureReason).toBeNull();
        });

        it('should build failed pending transaction', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                walletConnected: true,
            };

            const pending = buildPendingTransaction('deposit', values, 'failure');

            expect(pending.nextStatus).toBe('failure');
            expect(pending.failureReason).toBeDefined();
        });
    });

    describe('buildTransactionReceipt', () => {
        it('should build success receipt', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                walletConnected: true,
            };

            const pending = buildPendingTransaction('deposit', values, 'success');
            const receipt = buildTransactionReceipt(pending, 'success');

            expect(receipt.status).toBe('success');
            expect(receipt.failureReason).toBeNull();
            expect(receipt.message).toContain('confirmed');
        });

        it('should build failure receipt', () => {
            const values: TransactionFormValues = {
                amount: '100',
                walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                walletConnected: true,
            };

            const pending = buildPendingTransaction('deposit', values, 'failure');
            const receipt = buildTransactionReceipt(pending, 'failure');

            expect(receipt.status).toBe('failure');
            expect(receipt.failureReason).toBeDefined();
        });
    });
});
