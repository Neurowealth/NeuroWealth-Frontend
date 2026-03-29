import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
        },
        brand: {
          400: '#38bdf8',
        },
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        sky: {
          400: '#38bdf8',
          500: '#0ea5e9',
        },
        emerald: {
          400: '#34d399',
          500: '#10b981',
        },
        amber: {
          500: '#f59e0b',
        },
        cyan: {
          300: '#06b6d4',
          500: '#06b6d4',
        },
        red: {
          500: '#ef4444',
        },
        gray: {
          800: '#1f2937',
          900: '#111827',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
