import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import { ClientProviders } from "@/components/ClientProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CommandPalette } from "@/components/CommandPalette";
import { MAIN_CONTENT_LANDMARK_ID } from "@/lib/app-landmarks";
import { THEME_STORAGE_KEY } from "@/lib/theme-persistence";

const DiagnosticsPanel = dynamic(
  () => import("@/components/diagnostics/DiagnosticsPanel").then((mod) => mod.DiagnosticsPanel),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

/**
 * Theme boot script: runs before page paint to prevent theme flash.
 * Rendered as a raw inline <script> in <head> — deliberately NOT next/script.
 * Even strategy="beforeInteractive" only guarantees execution before Next's own
 * hydration code, not before first paint, which is what flash prevention needs.
 * See docs/third-party-scripts.md for guidance on adding more scripts.
 * Any analytics/wallet SDKs should use next/script with strategy
 * "afterInteractive" or "lazyOnload".
 *
 * Must mirror ThemeProvider resolution (see theme-persistence.ts).
 */
const themeHtmlBootScript = `(function(){try{var k=${JSON.stringify(
  THEME_STORAGE_KEY,
)};var r=document.documentElement;var v=localStorage.getItem(k);var m=window.matchMedia("(prefers-color-scheme: dark)");var x="dark";if(v==="light"||v==="dark"){x=v;}else{x=m.matches?"dark":"light";}r.classList.remove("light","dark");r.classList.add(x);}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL("https://neurowealth.app"),
  title: {
    default: "NeuroWealth — AI-Powered Yield on Stellar",
    template: "%s | NeuroWealth",
  },
  description:
    "NeuroWealth is an autonomous AI agent that deploys your USDC into the highest-yielding DeFi opportunities on Stellar — automatically, 24/7. No DeFi knowledge required.",
};

/**
 * viewport-fit=cover enables env(safe-area-inset-*) on notched iOS devices.
 * Required for MobileBottomNav and fixed CTAs to clear the home indicator.
 */
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeHtmlBootScript }} />
      </head>
      <body className={`${inter.className} antialiased font-sans bg-dark-900 text-slate-200`}>
        <a
          href={`#${MAIN_CONTENT_LANDMARK_ID}`}
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-sky-500 focus:text-white focus:font-semibold focus:shadow-lg focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-white"
        >
          Skip to main content
        </a>
        {/* WalletProvider is loaded client-side only (ssr:false) to prevent
            @creit.tech/stellar-wallets-kit from accessing `window` at SSR time */}
        <ClientProviders>
          <ErrorBoundary>
            {children}
            <DiagnosticsPanel />
            <CommandPalette />
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  );
}
