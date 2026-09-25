/**
 * TAILWIND TOKEN OWNERSHIP RULE
 * ─────────────────────────────
 * • globals.css @theme  → single source of truth for ALL design token values
 *                          (colors, shadows, spacing, motion, etc.)
 * • tailwind.config.ts  → content globs, animations, keyframes, fontFamily,
 *                          fontWeight, boxShadow, backdropBlur, motion tokens,
 *                          transitionTimingFunction, plugins, darkMode only.
 *                          Do NOT add duplicate color tokens here; put them in @theme.
 */
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["Roboto Mono", "JetBrains Mono", "monospace"],
      },
      fontWeight: {
        // Issue 29 spec: headings 600/700, body 400/500
        "heading": "600",
        "heading-bold": "700",
        "body": "400",
        "body-medium": "500",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-in-out",
        "slide-up": "slideUp 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {},
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
