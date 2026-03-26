import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/transactions/route';

describe('Transactions API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.NEUROWEALTH_API_BASE_URL;
    });

    it('should return quote for valid deposit', async () => {
        const request = new Request('http://localhost:3000/api/transactions', {
            method: 'POST',
            body: JSON.stringify({
                intent: 'quote',
                kind: 'deposit',
                values: {
                    amount: '100',
                    walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                    walletConnected: true,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.quote).toBeDefined();
        expect(data.quote.kind).toBe('deposit');
        expect(data.quote.amount).toBe(100);
        expect(data.quote.fee).toBe(0.06);
    });

    it('should return pending transaction for submit', async () => {
        const request = new Request('http://localhost:3000/api/transactions', {
            method: 'POST',
            body: JSON.stringify({
                intent: 'submit',
                kind: 'deposit',
                values: {
                    amount: '100',
                    walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                    walletConnected: true,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.pending).toBeDefined();
        expect(data.pending.kind).toBe('deposit');
    });

    it('should validate empty amount', async () => {
        const request = new Request('http://localhost:3000/api/transactions', {
            method: 'POST',
            body: JSON.stringify({
                intent: 'quote',
                kind: 'deposit',
                values: {
                    amount: '',
                    walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                    walletConnected: true,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.fieldErrors.amount).toBeDefined();
    });

    it('should validate wallet connection for deposit', async () => {
        const request = new Request('http://localhost:3000/api/transactions', {
            method: 'POST',
            body: JSON.stringify({
                intent: 'quote',
                kind: 'deposit',
                values: {
                    amount: '100',
                    walletAddress: 'GB4Q5QW7GWXW2P2UAEY6SVS2XHNRDXQ6T7MIP72N6YLHH6GXQK4YAP5G',
                    walletConnected: false,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.fieldErrors.walletConnected).toBeDefined();
    });

    it('should validate withdrawal address format', async () => {
        const request = new Request('http://localhost:3000/api/transactions', {
            method: 'POST',
            body: JSON.stringify({
                intent: 'quote',
                kind: 'withdrawal',
                values: {
                    amount: '100',
                    walletAddress: 'INVALID_ADDRESS',
                    walletConnected: true,
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(422);
        expect(data.fieldErrors.walletAddress).toBeDefined();
    });
});
