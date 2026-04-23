"use client";
import { ReactNode } from "react";
import { AuthProvider } from "@/contexts";
import { WalletProvider } from "@/contexts";
import { I18nProvider } from "@/contexts/I18nContext";
import { SandboxProvider } from "@/contexts/SandboxContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { ToastProvider } from "@/components/notifications/ToastProvider";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import { CookieBanner, PrivacyModal } from "@/components/cookie";

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <SandboxProvider>
      <ThemeProvider>
        <I18nProvider>
          <AuthProvider>
            <WalletProvider>
              <ToastProvider>
                <CookieConsentProvider>
                  {children}
                  <CookieBanner />
                  <PrivacyModal />
                </CookieConsentProvider>
              </ToastProvider>
            </WalletProvider>
          </AuthProvider>
        </I18nProvider>
      </ThemeProvider>
    </SandboxProvider>
  );
}
