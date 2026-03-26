import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { usePortfolio } from '@/hooks/usePortfolio';

vi.mock('@/lib/env', () => ({
    env: {
        apiUrl: 'http://localhost:3000',
    },
}));

describe('usePortfolio', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn();
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => usePortfolio(null));

        expect(result.current.portfolio).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should fetch portfolio data', async () => {
        const mockPortfolio = {
            balance: 1000,
            earnings: 100,
            apy: 8.5,
            strategy: 'balanced' as const,
        };

        global.fetch = vi.fn().mockResolvedValueOnce({
            json: vi.fn().mockResolvedValueOnce(mockPortfolio),
        });

        const { result } = renderHook(() =>
            usePortfolio('GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D')
        );

        await waitFor(() => {
            expect(result.current.portfolio).toEqual(mockPortfolio);
        });
    });

    it('should handle fetch error', async () => {
        global.fetch = vi.fn().mockRejectedValueOnce(new Error('Network error'));

        const { result } = renderHook(() =>
            usePortfolio('GBRPYHIL2CI3WHZDTOOQFC6EB4KJJGUJJGTP2GUKHTQKJ57XVJGLY7D')
        );

        await waitFor(() => {
            expect(result.current.error).toBe('Failed to load portfolio');
        });
    });

    it('should not fetch when address is null', () => {
        renderHook(() => usePortfolio(null));

        expect(global.fetch).not.toHaveBeenCalled();
    });
});
