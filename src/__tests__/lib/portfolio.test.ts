import { describe, it, expect } from 'vitest';
import {
    parseScenario,
    buildScenarioPayload,
    normalizePortfolioPayload,
    PortfolioScenario,
} from '@/lib/portfolio';

describe('Portfolio Utilities', () => {
    describe('parseScenario', () => {
        it('should parse empty scenario', () => {
            expect(parseScenario('empty')).toBe('empty');
        });

        it('should default to live scenario', () => {
            expect(parseScenario('live')).toBe('live');
            expect(parseScenario(null)).toBe('live');
            expect(parseScenario('invalid')).toBe('live');
        });
    });

    describe('buildScenarioPayload', () => {
        it('should build empty scenario payload', () => {
            const payload = buildScenarioPayload('empty');

            expect(payload.summary.totalBalance).toBe(0);
            expect(payload.summary.totalYield).toBe(0);
            expect(payload.allocation).toHaveLength(0);
            expect(payload.activity).toHaveLength(0);
            expect(payload.source).toBe('demo');
        });

        it('should build live scenario payload', () => {
            const payload = buildScenarioPayload('live');

            expect(payload.summary.totalBalance).toBeGreaterThan(0);
            expect(payload.summary.apy).toBeGreaterThan(0);
            expect(payload.allocation.length).toBeGreaterThan(0);
            expect(payload.activity.length).toBeGreaterThan(0);
            expect(payload.source).toBe('demo');
        });

        it('should apply overrides', () => {
            const payload = buildScenarioPayload('live', {
                source: 'api',
                notice: 'Custom notice',
            });

            expect(payload.source).toBe('api');
            expect(payload.notice).toBe('Custom notice');
        });

        it('should have valid allocation items', () => {
            const payload = buildScenarioPayload('live');

            payload.allocation.forEach((item) => {
                expect(item.id).toBeDefined();
                expect(item.label).toBeDefined();
                expect(item.symbol).toBeDefined();
                expect(item.amount).toBeGreaterThanOrEqual(0);
                expect(item.share).toBeGreaterThanOrEqual(0);
                expect(['primary', 'accent', 'warning', 'neutral-strong', 'neutral-soft']).toContain(
                    item.tone
                );
            });
        });

        it('should have valid activity items', () => {
            const payload = buildScenarioPayload('live');

            payload.activity.forEach((item) => {
                expect(item.id).toBeDefined();
                expect(item.title).toBeDefined();
                expect(['deposit', 'yield', 'rebalance', 'withdrawal']).toContain(item.kind);
                expect(['completed', 'scheduled', 'pending']).toContain(item.status);
            });
        });
    });

    describe('normalizePortfolioPayload', () => {
        it('should normalize valid payload', () => {
            const input = {
                summary: {
                    totalBalance: 1000,
                    totalYield: 100,
                    apy: 8.5,
                    strategy: 'balanced',
                },
                allocation: [
                    {
                        id: 'test-1',
                        label: 'Test Asset',
                        symbol: 'TEST',
                        amount: 500,
                        share: 50,
                        change: 1.5,
                        tone: 'primary',
                    },
                ],
                activity: [
                    {
                        id: 'activity-1',
                        kind: 'deposit',
                        title: 'Test Deposit',
                        detail: 'Test detail',
                        occurredAt: new Date().toISOString(),
                        amount: 500,
                        status: 'completed',
                    },
                ],
            };

            const normalized = normalizePortfolioPayload(input, 'api');

            expect(normalized.summary.totalBalance).toBe(1000);
            expect(normalized.summary.strategy).toBe('balanced');
            expect(normalized.allocation).toHaveLength(1);
            expect(normalized.activity).toHaveLength(1);
            expect(normalized.source).toBe('api');
        });

        it('should handle missing fields with defaults', () => {
            const input = {
                summary: {},
                allocation: [],
                activity: [],
            };

            const normalized = normalizePortfolioPayload(input, 'demo');

            expect(normalized.summary.totalBalance).toBe(0);
            expect(normalized.summary.strategy).toBe('balanced');
            expect(normalized.allocation).toHaveLength(0);
            expect(normalized.activity).toHaveLength(0);
        });

        it('should normalize alternative field names', () => {
            const input = {
                portfolio: {
                    balance: 2000,
                    yield: 200,
                    apy: 10,
                },
                positions: [
                    {
                        name: 'Asset Name',
                        asset: 'ASSET',
                        value: 1000,
                        percentage: 50,
                    },
                ],
                transactions: [
                    {
                        type: 'deposit',
                        name: 'Deposit Event',
                        description: 'Test',
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            const normalized = normalizePortfolioPayload(input, 'api');

            expect(normalized.summary.totalBalance).toBe(2000);
            expect(normalized.allocation[0].label).toBe('Asset Name');
            expect(normalized.activity[0].kind).toBe('deposit');
        });
    });
});
