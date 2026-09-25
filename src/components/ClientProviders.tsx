"use client";
import { ReactNode } from "react";
import { Networks } from "@stellar/stellar-sdk";
import { AuthProvider } from "@/contexts";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const WalletProvider = dynamic(
  () => import("@/contexts/WalletProvider").then((mod) => mod.WalletProvider),
  { ssr: false }
);
import { I18nProvider } from "@/contexts/I18nContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieBanner, PrivacyModal } from "@/components/cookie";
import { composeProviders } from "@/lib/composeProviders";
import { useErrorTracking } from "@/hooks/useErrorTracking";

/** Mounts global error tracking (window error + unhandledrejection → logger). */
function ErrorTrackingMount() {
  useErrorTracking();
  return null;
}

function resolveStellarConfig() {
  const rawNetwork = (process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet").toLowerCase();
  const isMainnet = rawNetwork === "mainnet" || rawNetwork === "public";
  const network = isMainnet ? Networks.PUBLIC : Networks.TESTNET;
  const fallbackHorizonUrl = isMainnet
    ? "https://horizon.stellar.org"
    : "https://horizon-testnet.stellar.org";

  return {
    network,
    horizonUrl: process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL || fallbackHorizonUrl,
  };
}

// Hoisted to module scope so provider component identity stays stable across
// ClientProviders re-renders. Calling composeProviders() inside the component
// body created a new component type every render and remounted the whole tree.
const stellarConfig = resolveStellarConfig();

// Providers are grouped into named sub-composers by concern, then combined
// below in the same order the flat list used before — order matters because
// each provider can only read context from providers above it in the tree,
// and some (e.g. ToastProvider surfacing auth errors) depend on that.
//
//   1. AppShellProviders — display/runtime concerns with no dependencies on
//      the others: sandbox mode, theme, locale.
//   2. AuthProviders — identity; sits above feedback so toasts triggered by
//      auth actions (login/logout) can read the auth context if needed.
//   3. FeedbackProviders — user-facing feedback surfaces: toasts and the
//      cookie-consent banner/modal state.
const AppShellProviders = composeProviders([SandboxProvider, ThemeProvider, I18nProvider]);
const AuthProviders = composeProviders([AuthProvider]);
const FeedbackProviders = composeProviders([ToastProvider, CookieConsentProvider]);

const Providers = composeProviders([
  AppShellProviders,
  AuthProviders,
  FeedbackProviders,
]);

export function ClientProviders({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWalletPossible = pathname?.startsWith("/dashboard") || pathname?.startsWith("/profile");

  return (
    <Providers>
      <ErrorTrackingMount />
      {isWalletPossible ? (
        <WalletProvider network={stellarConfig.network} horizonUrl={stellarConfig.horizonUrl}>
          {children}
        </WalletProvider>
      ) : (
        children
      )}
      <CookieBanner />
      <PrivacyModal />
    </Providers>
  );
}
