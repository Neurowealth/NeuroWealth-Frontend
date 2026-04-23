import type { Config } from 'tailwindcss';

/* ─── tailwind.config.ts ─────────────────────────────────────────────────────
   Scope: content paths, plugins, animations only.
   All design tokens live in src/app/globals.css @theme.
────────────────────────────────────────────────────────────────────────────── */
const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      animation: {
        shimmer:    'shimmer 1.5s infinite',
        'fade-in':  'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.2s ease-out',
      },
      keyframes: {
        shimmy: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'skeleton-gradient':
          'linear-gradient(90deg, #1F2937 25%, #374151 50%, #1F2937 75%)',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
