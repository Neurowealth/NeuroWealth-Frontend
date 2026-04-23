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
        // App-level
        "app-bg": "#030712",
        // Widget surfaces (Issue 29 spec)
        "surface": "#111827",
        "surface-border": "#1F2937",
        "surface-elevated": "#1F2937",
        // Primary / focus ring color (Issue 29 spec)
        "primary": "#0EA5E9",
        "primary-hover": "#0284C7",
        // Text
        "text-primary": "#F9FAFB",
        "text-secondary": "#9CA3AF",
        "text-muted": "#6B7280",
        // Status
        "success": "#10B981",
        "error": "#EF4444",
        "warning": "#F59E0B",
        "info": "#0EA5E9",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      fontWeight: {
        // Issue 29 spec: headings 600/700, body 400/500
        "heading": "600",
        "heading-bold": "700",
        "body": "400",
        "body-medium": "500",
      },
      animation: {
        shimmer: "shimmer 1.5s infinite",
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "skeleton-gradient":
          "linear-gradient(90deg, #1F2937 25%, #374151 50%, #1F2937 75%)",
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
      motion: {
        'duration-120': '120ms',
        'duration-180': '180ms',
        'duration-240': '240ms',
      },
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
    },
  },
  plugins: [],
  darkMode: 'class',
};

export default config;
