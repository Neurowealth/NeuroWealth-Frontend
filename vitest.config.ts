import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['src/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['node_modules', 'e2e', '.next', 'dist'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html', 'lcov'],
            exclude: [
                'node_modules/',
                'vitest.setup.ts',
                '**/*.d.ts',
                '**/*.config.*',
                '**/dist/**',
                '**/.next/**',
                'e2e/**',
            ],
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
});
