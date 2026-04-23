import type { Metadata } from "next";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { DiagnosticsPanel } from "@/components/diagnostics/DiagnosticsPanel";

export const metadata: Metadata = {
  metadataBase: new URL("https://neurowealth.app"),
  title: {
    default: "NeuroWealth — AI-Powered Yield on Stellar",
    template: "%s | NeuroWealth",
  },
  description:
    "NeuroWealth is an autonomous AI agent that deploys your USDC into the highest-yielding DeFi opportunities on Stellar — automatically, 24/7. No DeFi knowledge required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased font-sans bg-dark-900 text-slate-200">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-sky-500 focus:text-white focus:font-semibold focus:shadow-lg"
        >
          Skip to main content
        </a>
        {/* WalletProvider is loaded client-side only (ssr:false) to prevent
            @creit.tech/stellar-wallets-kit from accessing `window` at SSR time */}
        <ClientProviders>
          <ErrorBoundary>
            {children}
            <DiagnosticsPanel />
          </ErrorBoundary>
        </ClientProviders>
      </body>
    </html>
  );
}
