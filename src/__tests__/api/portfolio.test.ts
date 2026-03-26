import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/portfolio/route';
import { NextRequest } from 'next/server';

describe('Portfolio API Route', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete process.env.NEUROWEALTH_API_BASE_URL;
    });

    it('should return empty scenario payload', async () => {
        const request = new NextRequest('http://localhost:3000/api/portfolio?scenario=empty');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.summary.totalBalance).toBe(0);
        expect(data.allocation).toHaveLength(0);
        expect(data.activity).toHaveLength(0);
    });

    it('should return live scenario payload', async () => {
        const request = new NextRequest('http://localhost:3000/api/portfolio?scenario=live');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.summary.totalBalance).toBeGreaterThan(0);
        expect(data.allocation.length).toBeGreaterThan(0);
        expect(data.activity.length).toBeGreaterThan(0);
    });

    it('should default to live scenario', async () => {
        const request = new NextRequest('http://localhost:3000/api/portfolio');
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.summary.totalBalance).toBeGreaterThan(0);
    });

    it('should include cache control headers', async () => {
        const request = new NextRequest('http://localhost:3000/api/portfolio');
        const response = await GET(request);

        expect(response.headers.get('Cache-Control')).toBe('no-store');
        expect(response.headers.get('x-neurowealth-source')).toBeDefined();
    });
});
